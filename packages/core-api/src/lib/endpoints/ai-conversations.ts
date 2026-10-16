import {
  AiConversation,
  ChatMessage,
  CreateAiConversation,
  PostAiConversationMessage,
  StreamEvent,
  UpdateAiConversation,
} from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import { ApiError } from '../api-client/api-error';
import { ApiCollectionResponse, GetCollectionQueryParams, GetQueryByIdParams } from '../types';

export interface GetAiConversationsStaticFilter {
  organizationId: string;
}

export interface GetAiConversationMessagesStaticFilter {
  organizationId: string;
  conversationId: string;
}

export class AiConversationsEndpoint {
  constructor(private client: ApiClient) {}

  async getAiConversations(
    params: GetCollectionQueryParams<AiConversation, GetAiConversationsStaticFilter>,
  ): Promise<ApiCollectionResponse<AiConversation>> {
    const { staticParams, fields, sort, filters, offset = 0, limit = 20 } = params;
    return this.client.getCollection<AiConversation>(
      `/api/v1/organizations/${staticParams?.organizationId}/ai-conversations`,
      fields,
      {
        offset,
        limit,
        ...filters,
        sort,
      },
    );
  }

  async getAiConversation(
    params: GetQueryByIdParams<AiConversation, GetAiConversationsStaticFilter>,
  ): Promise<AiConversation> {
    const { staticParams, id, fields } = params;
    return this.client.getById<AiConversation>(
      `/api/v1/organizations/${staticParams?.organizationId}/ai-conversations/${id}`,
      fields,
    );
  }

  async createAiConversation(
    organizationId: string,
    data: CreateAiConversation,
  ): Promise<AiConversation> {
    return this.client.post<AiConversation>(
      `/api/v1/organizations/${organizationId}/ai-conversations`,
      data,
    );
  }

  async updateAiConversation(
    organizationId: string,
    conversationId: string,
    data: UpdateAiConversation,
  ): Promise<AiConversation> {
    return this.client.patch<AiConversation>(
      `/api/v1/organizations/${organizationId}/ai-conversations/${conversationId}`,
      data,
    );
  }

  async deleteAiConversation(
    organizationId: string,
    conversationId: string,
  ): Promise<void> {
    return this.client.delete(
      `/api/v1/organizations/${organizationId}/ai-conversations/${conversationId}`,
    );
  }

  /** Messages, newest first (created DESC). */
  async getAiConversationMessages(
    params: GetCollectionQueryParams<ChatMessage, GetAiConversationMessagesStaticFilter>,
  ): Promise<ApiCollectionResponse<ChatMessage>> {
    const { staticParams, fields, offset = 0, limit = 20, filters } = params;
    return this.client.getCollection<ChatMessage>(
      `/api/v1/organizations/${staticParams?.organizationId}/ai-conversations/${staticParams?.conversationId}/messages`,
      fields,
      {
        offset,
        limit,
        ...filters,
      },
    );
  }

  /** Sends a user turn; the assistant's answer is streamed back as SSE events. */
  async postAiConversationMessage(
    organizationId: string,
    conversationId: string,
    data: PostAiConversationMessage,
    onEvent?: (event: StreamEvent) => void,
    onError?: (error: ApiError) => void,
    onComplete?: () => void,
  ): Promise<void> {
    return this.client.postStream(
      `/api/v1/organizations/${organizationId}/ai-conversations/${conversationId}/messages`,
      data,
      onEvent,
      onError,
      onComplete,
    );
  }
}
