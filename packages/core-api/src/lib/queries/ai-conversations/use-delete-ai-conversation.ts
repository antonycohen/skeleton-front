import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';

export type DeleteAiConversationParams = {
  organizationId: string;
  conversationId: string;
};

export const deleteAiConversation = async (
  params: DeleteAiConversationParams,
): Promise<void> => {
  return await skeletonApi.aiConversations.deleteAiConversation(
    params.organizationId,
    params.conversationId,
  );
};

export const useDeleteAiConversation = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteAiConversationParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAiConversation,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-conversations', args[1].organizationId],
      });
      queryClient.removeQueries({
        queryKey: ['ai-conversation', args[1].conversationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
