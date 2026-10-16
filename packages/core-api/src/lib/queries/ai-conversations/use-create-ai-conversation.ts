import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { AiConversation, CreateAiConversation } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type CreateAiConversationParams = {
  organizationId: string;
  data: CreateAiConversation;
};

export const createAiConversation = async (
  params: CreateAiConversationParams,
): Promise<AiConversation> => {
  return await skeletonApi.aiConversations.createAiConversation(
    params.organizationId,
    params.data,
  );
};

export const useCreateAiConversation = (
  options?: Omit<
    UseMutationOptions<AiConversation, ApiError, CreateAiConversationParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAiConversation,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-conversations', args[1].organizationId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
