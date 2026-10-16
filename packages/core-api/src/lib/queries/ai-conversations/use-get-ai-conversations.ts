import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { AiConversation } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetAiConversationsStaticFilter } from '../../endpoints/ai-conversations';

export type GetAiConversationsParams = GetCollectionQueryParams<
  AiConversation,
  GetAiConversationsStaticFilter
>;

export const getAiConversations = async (
  params: GetAiConversationsParams,
): Promise<ApiCollectionResponse<AiConversation>> => {
  return await skeletonApi.aiConversations.getAiConversations(params);
};

export const useGetAiConversations = (
  params: GetAiConversationsParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<AiConversation>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['ai-conversations', params.staticParams?.organizationId, params],
    queryFn: () => getAiConversations(params),
    ...options,
  });
