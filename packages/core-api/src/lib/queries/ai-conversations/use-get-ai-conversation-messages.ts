import { ApiCollectionResponse, GetCollectionQueryParams } from '../../types';
import { ChatMessage } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { GetAiConversationMessagesStaticFilter } from '../../endpoints/ai-conversations';

export type GetAiConversationMessagesParams = GetCollectionQueryParams<
  ChatMessage,
  GetAiConversationMessagesStaticFilter
>;

export const getAiConversationMessages = async (
  params: GetAiConversationMessagesParams,
): Promise<ApiCollectionResponse<ChatMessage>> => {
  return await skeletonApi.aiConversations.getAiConversationMessages(params);
};

export const useGetAiConversationMessages = (
  params: GetAiConversationMessagesParams,
  options?: Omit<
    UseQueryOptions<ApiCollectionResponse<ChatMessage>, ApiError>,
    'queryKey'
  >,
) =>
  useQuery({
    queryKey: ['ai-conversations', params.staticParams?.conversationId, 'messages', params],
    queryFn: () => getAiConversationMessages(params),
    ...options,
  });
