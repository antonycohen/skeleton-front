import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { ReadSsoConnection } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';
import { invalidateSsoQueries } from './invalidate-sso-queries';

export type ImportSsoConnectionMetadataParams = {
  organizationId: string;
};

export const importSsoConnectionMetadata = async (
  params: ImportSsoConnectionMetadataParams,
): Promise<ReadSsoConnection> => {
  return await skeletonApi.ssoConnections.importSsoConnectionMetadata(
    params.organizationId,
  );
};

/**
 * Applies what the identity provider's metadata announces now: entity id, sign-on address and
 * certificates. The scheduled re-read only reports a change (`idp_metadata_changed_at`), so this is
 * the admin's answer to it. It is a trust change like any other — a new entity id or sign-on
 * address, or certificates that replace every valid one, returns the connection to draft.
 */
export const useImportSsoConnectionMetadata = (
  options?: Omit<
    UseMutationOptions<
      ReadSsoConnection,
      ApiError,
      ImportSsoConnectionMetadataParams
    >,
    'mutationFn'
  >,
) => {
  const { onSuccess, ...restOptions } = options || {};
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importSsoConnectionMetadata,
    onSuccess: (...args) => {
      invalidateSsoQueries(queryClient, args[1].organizationId);
      onSuccess?.(...args);
    },
    ...restOptions,
  });
};
