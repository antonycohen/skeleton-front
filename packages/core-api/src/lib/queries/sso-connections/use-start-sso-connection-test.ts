import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ReadSsoTestSignIn } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type StartSsoConnectionTestParams = {
  organizationId: string;
};

export const startSsoConnectionTest = async (
  params: StartSsoConnectionTestParams,
): Promise<ReadSsoTestSignIn> => {
  return await skeletonApi.ssoConnections.startSsoConnectionTest(
    params.organizationId,
  );
};

/**
 * Asks for the one-time link of a test sign-in (ten minutes, one use), which the caller opens in a
 * popup. Nothing is invalidated here: the test only marks the connection `tested` once the admin
 * has come back from the identity provider, so the caller refetches when the popup closes.
 */
export const useStartSsoConnectionTest = (
  options?: Omit<
    UseMutationOptions<ReadSsoTestSignIn, ApiError, StartSsoConnectionTestParams>,
    'mutationFn'
  >,
) =>
  useMutation({
    mutationFn: startSsoConnectionTest,
    ...options,
  });
