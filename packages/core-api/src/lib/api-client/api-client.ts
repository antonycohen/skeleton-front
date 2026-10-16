import { toCamelKey, toSnakeKey } from './key-case';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { TokenManager } from './token-manager';
import { ApiError } from './api-error';
import { toCamelCase, toSnakeCase } from './case-converter';
import applyCaseMiddleware from 'axios-case-converter';
import { ApiCollectionResponse, FieldQuery } from '../types';
import { serializeFieldsQuery } from '../utils/serialize-fields-query';
import { StreamEvent } from '@skeleton/core-api-models';
import { useWorkspaceStore } from '@skeleton/core-store-workspace';

interface ApiClientConfig {
  baseUrl: string;
}

/** A request that already used the one retry a 401 is allowed. */
type RetriableRequestConfig = InternalAxiosRequestConfig & { retriedAfterUnauthorized?: boolean };

class ApiClient {
  private readonly config: ApiClientConfig;
  private readonly tokenManager: TokenManager | null = null;
  private readonly axiosInstance: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.tokenManager = new TokenManager();

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.axiosInstance = applyCaseMiddleware(this.axiosInstance, {
      caseFunctions: {
        // Dot notation is preserved (each part converted separately); shared with the
        // embedded-payload reader so both paths shape keys identically.
        camel: toCamelKey,
        snake: toSnakeKey,
        header: (input) => input,
      },
    });

    // Request interceptor to add token and workspace ID
    this.axiosInstance.interceptors.request.use(async (config) => {
      try {
        const token = await this.getValidToken();
        config.headers.Authorization = `Bearer ${token}`;

        const workspaceId = useWorkspaceStore.getState().workspaceId;
        if (workspaceId) {
          config.headers['X-Skeleton-OrganizationId'] = workspaceId;
        }

        return config;
      }catch (error) {
        return config;
      }

    });

    // Response interceptor for token refresh: one retry per request, then the token is cleared.
    // The marker is a flag on the request config, not a header: it used to be set under one header
    // name and checked under another, so the guard never matched and a request refused with 401
    // was retried in a tight loop for as long as the token looked unexpired.
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest.retriedAfterUnauthorized
        ) {
          originalRequest.retriedAfterUnauthorized = true;
          const newToken = await this.getValidToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.axiosInstance(originalRequest);
        }

        if(error.response?.status === 401) {
          this.tokenManager?.clearToken();
        }

        return Promise.reject(error);
      },
    );
  }

  private async getValidToken(): Promise<string> {
    if (!this.tokenManager) {
      throw new Error('Token manager not configured');
    }
    return this.tokenManager.getValidToken();
  }

  async request<T>(
    endpoint: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.request<T>({
        url: endpoint,
        ...config,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw await ApiError.fromAxiosResponse(error.response);
      }
      throw error;
    }
  }

  async getById<T>(
    endpoint: string,
    fields?: FieldQuery<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'GET',
      params: {
        fields: fields ? serializeFieldsQuery(fields) : undefined,
        ...config?.params,
      },
    });
    return response.data;
  }

  async getCollection<T>(
    endpoint: string,
    fields?: FieldQuery<T>,
    query?: object,
    config?: AxiosRequestConfig,
  ): Promise<ApiCollectionResponse<T>> {
    const response = await this.request<T[]>(endpoint, {
      ...config,
      method: 'GET',
      params: {
        fields: fields ? serializeFieldsQuery<T>(fields) : undefined,
        ...query,
        ...config?.params,
      },
    });

    return {
      data: response.data,
      pagination: {
        count: Number(response.headers['xTotalCount']),
        limit: Number(response.headers['xLimit']),
        offset: Number(response.headers['xOffset']),
      },
    };
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      data: data ? toSnakeCase(data) : undefined,
    });
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      data: data ? toSnakeCase(data) : undefined,
    });
    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    fields?: FieldQuery<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      data: data ? toSnakeCase(data) : undefined,
      params: {
        fields: fields ? serializeFieldsQuery(fields) : undefined,
        ...config?.params,
      },
    });
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
    return response.data;
  }

  async getText(endpoint: string, config?: AxiosRequestConfig): Promise<string> {
    const response = await this.request<string>(endpoint, {
      ...config,
      method: 'GET',
      responseType: 'text',
      // axios still tries JSON.parse on json-looking strings; force identity.
      transformResponse: [(data) => data],
    });
    return response.data;
  }

  async postStream(
    endpoint: string,
    data?: unknown,
    onEvent?: (event: StreamEvent) => void,
    onError?: (error: ApiError) => void,
    onComplete?: () => void,
  ): Promise<void> {
    const token = await this.getValidToken();
    const url = `${this.config.baseUrl}${endpoint}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: data ? JSON.stringify(toSnakeCase(data)) : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status >= 400 && response.status < 500) {
            const errorBody = await response.json();
            onError?.(new ApiError(toCamelCase(errorBody)));
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          // Process complete messages (separated by \n\n)
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep incomplete message in buffer

          for (const message of messages) {
            if (message.trim() === '') continue;

            // Parse SSE format
            const lines = message.split('\n');
            let eventData = '';

            for (const line of lines) {
              if (line.startsWith('data:')) {
                eventData += line.slice(5).trim();
              }
            }

            // Parse and handle the event
            if (eventData) {
              try {
                const parsedEvent = toCamelCase(JSON.parse(eventData)) as StreamEvent;
                onEvent?.(parsedEvent);
              } catch (e) {
                console.error('Failed to parse SSE event:', e);
              }
            }
          }
        }
      })
      .catch((error) => {
        onError?.(error);
      });
  }
}

export { ApiClient };
export type { ApiClientConfig };
