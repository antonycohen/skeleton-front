import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import {
  UpdateLocalizationPreferences,
  UpdateNotificationsPreferences,
  UpdateUserInfo,
  User,
} from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type UpdateUserParams = {
  userId: string;
  data: UpdateUserInfo | UpdateLocalizationPreferences | UpdateNotificationsPreferences;
};

export const updateUser = async (params: UpdateUserParams): Promise<User> => {
  return await skeletonApi.users.updateUser(params.userId, params.data);
};

export const useUpdateUser = (
  options?: Omit<
    UseMutationOptions<User, ApiError, UpdateUserParams>,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({
        queryKey: ['user', args[1].userId],
      });
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
