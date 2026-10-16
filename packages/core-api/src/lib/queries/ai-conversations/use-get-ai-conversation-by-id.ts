import { GetQueryByIdParams } from '../../types';
import { AiConversation } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetAiConversationsStaticFilter } from '../../endpoints/ai-conversations';

export type GetAiConversationByIdParams = GetQueryByIdParams<
  AiConversation,
  GetAiConversationsStaticFilter
>;

export const getAiConversationById = async (
  params: GetAiConversationByIdParams,
): Promise<AiConversation> => {
  return await skeletonApi.aiConversations.getAiConversation(params);
};

export const useGetAiConversationById = (
  params: GetAiConversationByIdParams,
  options?: Omit<UseQueryOptions<AiConversation, ApiError>, 'queryKey'>,
) =>
  useQuery({
    queryKey: ['ai-conversation', params.id, params.fields],
    queryFn: () => getAiConversationById(params),
    ...options,
  });
