import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  MfaCodeRequest,
  MfaEnrolment,
  MfaFreshProofRequest,
  MfaRecoveryCodes,
  MfaStatus,
  UpdateLocalizationPreferences,
  UpdateNotificationsPreferences,
  UpdateUserInfo,
  User
} from '@skeleton/core-api-models';
import {ApiClient} from '../api-client/api-client';
import {ApiCollectionResponse, GetCollectionQueryParams, GetQueryByIdParams} from '../types';


export class UsersEndpoint {
  constructor(private client: ApiClient) {}

  async getUser(params: GetQueryByIdParams<User>): Promise<User> {
    const response = this.client.getById<User>(`/api/v1/users/${params.id}`, params.fields);

    console.log(response);
    return response;
  }

  async getUsers(params: GetCollectionQueryParams<User>): Promise<ApiCollectionResponse<User>> {
    const { fields, offset, limit, filters } = params;
    return this.client.getCollection<User>('/api/v1/users', fields, {
      offset,
      limit,
      ...filters
    });
  }

  async updateUser(userId: string, updates: UpdateUserInfo | UpdateLocalizationPreferences | UpdateNotificationsPreferences): Promise<User> {
    return this.client.patch<User>(`/api/v1/users/${userId}`, updates);
  }

  async changeEmail(userId: string, body: ChangeEmailRequest): Promise<void> {
    return this.client.post<void>(`/api/v1/users/${userId}/change-email-request`, body);
  }

  async changePassword(userId: string, body: ChangePasswordRequest): Promise<void> {
    return this.client.post<void>(`/api/v1/users/${userId}/change-password-request`, body);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/users/${userId}`);
  }

  // --- Two-factor authentication (TOTP). Self-service: the token must belong to userId (resetMfa excepted). ---

  async getMfaStatus(userId: string): Promise<MfaStatus> {
    return this.client.getById<MfaStatus>(`/api/v1/users/${userId}/mfa`);
  }

  /** Starts (or restarts) enrolment; 409 while MFA is active. */
  async startMfaEnrolment(userId: string): Promise<MfaEnrolment> {
    return this.client.post<MfaEnrolment>(`/api/v1/users/${userId}/mfa/totp`, {});
  }

  /** Confirms enrolment with one authenticator code and returns the recovery codes (once). */
  async activateMfa(userId: string, body: MfaCodeRequest): Promise<MfaRecoveryCodes> {
    return this.client.post<MfaRecoveryCodes>(`/api/v1/users/${userId}/mfa/totp/activate`, body);
  }

  async disableMfa(userId: string, body: MfaFreshProofRequest): Promise<void> {
    return this.client.post<void>(`/api/v1/users/${userId}/mfa/disable`, body);
  }

  async regenerateMfaRecoveryCodes(userId: string, body: MfaFreshProofRequest): Promise<MfaRecoveryCodes> {
    return this.client.post<MfaRecoveryCodes>(`/api/v1/users/${userId}/mfa/recovery-codes`, body);
  }

  /**
   * Back office only (super admin), the one MFA call made on someone else's account: clears the
   * user's second factor so they enrol again at their next sign-in.
   */
  async resetMfa(userId: string): Promise<void> {
    return this.client.post<void>(`/api/v1/users/${userId}/mfa/reset`);
  }
}
