import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { MfaEnrolment } from '@skeleton/core-api-models';
import { ApiError, skeletonApi } from '../../api';

export type StartMfaEnrolmentParams = {
  userId: string;
};

export const startMfaEnrolment = async (params: StartMfaEnrolmentParams): Promise<MfaEnrolment> => {
  return await skeletonApi.users.startMfaEnrolment(params.userId);
};

/**
 * Starts (or restarts) TOTP enrolment. Nothing to invalidate: the status only changes once the
 * enrolment is confirmed with `useActivateMfa`. Responds 409 while MFA is already active.
 */
export const useStartMfaEnrolment = (
  options?: Omit<UseMutationOptions<MfaEnrolment, ApiError, StartMfaEnrolmentParams>, 'mutationFn'>,
) =>
  useMutation({
    mutationFn: startMfaEnrolment,
    ...options,
  });
