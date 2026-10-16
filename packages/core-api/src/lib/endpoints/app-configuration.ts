import { ReadAppConfiguration } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';

export class AppConfigurationEndpoint {
  constructor(private client: ApiClient) {}

  async getAppConfiguration(): Promise<ReadAppConfiguration> {
    return this.client.getById<ReadAppConfiguration>(
      '/api/v1/app-configuration',
    );
  }
}
