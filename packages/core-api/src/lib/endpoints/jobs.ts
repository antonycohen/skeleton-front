import { ReadJob } from '@skeleton/core-api-models';
import { ApiClient } from '../api-client/api-client';
import {
  ApiCollectionResponse,
  GetCollectionQueryParams,
  GetQueryByIdParams,
} from '../types';

export interface GetJobsFilter {
  ids?: string[];
  name?: string;
  organizationId?: string;
  parentType?: string;
  parentId?: string;
}

export class JobsEndpoint {
  constructor(private client: ApiClient) {}

  async getJob(params: GetQueryByIdParams<ReadJob>): Promise<ReadJob> {
    return this.client.getById<ReadJob>(
      `/api/v1/jobs/${params.id}`,
      params.fields,
    );
  }

  async getJobs(
    params: GetCollectionQueryParams<ReadJob, GetJobsFilter>,
  ): Promise<ApiCollectionResponse<ReadJob>> {
    const { fields, offset, limit, filters, sort } = params;
    return this.client.getCollection<ReadJob>('/api/v1/jobs', fields, {
      offset,
      limit,
      ...filters,
      sort,
    });
  }
}
