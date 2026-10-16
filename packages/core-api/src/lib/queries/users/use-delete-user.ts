import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError, skeletonApi } from '../../api';

export type DeleteUserParams = {
  userId: string;
};

export const deleteUser = async (params: DeleteUserParams): Promise<void> => {
  return await skeletonApi.users.deleteUser(params.userId);
};

export const useDeleteUser = (
  options?: Omit<
    UseMutationOptions<void, ApiError, DeleteUserParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.removeQueries({
        queryKey: ['user', args[1].userId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
