import { ApiError as ApiErrorType } from '@skeleton/core-api-models';
import { AxiosResponse } from 'axios';

type BaseApiError = {
  httpCode: number;
  errorCode: number;
  statusCode: number;
  error: string;
  parametersErrors: {
    [key: string]: string[];
  };
};

export class ApiError extends Error implements ApiErrorType {
  httpCode: number;
  errorCode: number;
  statusCode: number;
  error: string;
  parametersErrors: { [key: string]: string[] };

  constructor(errorData: BaseApiError) {
    super(errorData.error);
    this.name = 'ApiError';
    this.error = errorData.error;
    this.httpCode = errorData.httpCode || errorData.statusCode;
    this.errorCode = errorData.errorCode;
    this.statusCode = errorData.statusCode;
    this.parametersErrors = errorData.parametersErrors || {};
  }

  static async fromAxiosResponse(response: AxiosResponse): Promise<ApiError> {
    try {
      const errorData = response.data;

      return new ApiError({
        httpCode: response.status,
        errorCode: errorData.errorCode || errorData.code || 0,
        statusCode: errorData.statusCode || response.status,
        error: errorData.error || errorData.message || response.statusText || 'Unknown error',
        parametersErrors: errorData.parametersErrors || {},
      });
    } catch {
      return new ApiError({
        httpCode: response.status,
        errorCode: 0,
        statusCode: response.status,
        error: response.statusText || 'Unknown error',
        parametersErrors: {},
      });
    }
  }
}
