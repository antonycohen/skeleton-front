import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { AiConversation, UpdateAiConversation } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateAiConversationParams = {
  organizationId: string;
  conversationId: string;
  data: UpdateAiConversation;
};

export const updateAiConversation = async (
  params: UpdateAiConversationParams,
): Promise<AiConversation> => {
  return await skeletonApi.aiConversations.updateAiConversation(
    params.organizationId,
    params.conversationId,
    params.data,
  );
};

export const useUpdateAiConversation = (
  options?: Omit<
    UseMutationOptions<AiConversation, ApiError, UpdateAiConversationParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAiConversation,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-conversations', args[1].organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['ai-conversation', args[1].conversationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
