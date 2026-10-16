import {useMutation, UseMutationOptions, useQueryClient,} from '@tanstack/react-query';
import {ChangeEmailRequest} from '@skeleton/core-api-models';
import {ApiError, skeletonApi} from '../../api';

export type ChangeEmailParams = {
  userId: string;
  data: ChangeEmailRequest
}

export const changeEmail = async (params: ChangeEmailParams): Promise<void> => {
  return await skeletonApi.users.changeEmail(params.userId, params.data);
};

export const useChangeEmail = (
  options?: Omit<
    UseMutationOptions<void, ApiError, ChangeEmailParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeEmail,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
