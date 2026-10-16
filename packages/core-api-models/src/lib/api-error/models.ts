export type ApiError = {
  httpCode: number;
  errorCode: number;
  statusCode: number;
  error: string;
  parametersErrors: {
    [key: string]: string[];
  };
};
