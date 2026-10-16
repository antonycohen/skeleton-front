import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useOAuthStore } from '@skeleton/core-store-oauth';

const getNewToken = vi.fn();

vi.mock('../oauth-client/oauth-client', () => ({
  getNewToken: (...args: unknown[]) => getNewToken(...args),
}));

vi.mock('@skeleton/core-store-workspace', () => ({
  useWorkspaceStore: { getState: () => ({ workspaceId: null }) },
}));

const { ApiClient } = await import('./api-client');

const IN_ONE_HOUR = () => Date.now() + 60 * 60 * 1000;

/** A stubbed transport answering each request in turn with the given statuses, recording what it saw. */
const stubTransport = (client: InstanceType<typeof ApiClient>, statuses: number[]) => {
  const calls: InternalAxiosRequestConfig[] = [];
  const axiosInstance = (client as unknown as { axiosInstance: AxiosInstance }).axiosInstance;
  axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    calls.push(config);
    const status = statuses[Math.min(calls.length, statuses.length) - 1];
    const response: AxiosResponse = {
      data: status === 200 ? [] : { error: 'invalid_token' },
      status,
      statusText: '',
      headers: {},
      config,
    };
    if (status >= 400) {
      throw new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, config, null, response);
    }
    return response;
  };
  return calls;
};

describe('ApiClient on a 401', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useOAuthStore.getState().setAuth({
      accessToken: 'unexpired',
      refreshToken: 'refresh-1',
      accessTokenExpirationDate: IN_ONE_HOUR(),
    });
  });

  it('retries the request once', async () => {
    const client = new ApiClient({ baseUrl: 'http://api.test' });
    const calls = stubTransport(client, [401, 200]);

    const response = await client.request('/news');

    expect(response.status).toBe(200);
    expect(calls).toHaveLength(2);
    expect(calls[1].headers.Authorization).toBe('Bearer unexpired');
    expect(calls[1].headers['RetryRequest']).toBeUndefined();
    expect(useOAuthStore.getState().accessToken).toBe('unexpired');
  });

  it('clears the token after the retry is refused too, instead of looping', async () => {
    const client = new ApiClient({ baseUrl: 'http://api.test' });
    const calls = stubTransport(client, [401, 401]);

    await expect(client.request('/news')).rejects.toBeDefined();

    expect(calls).toHaveLength(2);
    expect(getNewToken).not.toHaveBeenCalled();
    expect(useOAuthStore.getState().accessToken).toBeNull();
  });
});

// B-260: once two-factor authentication becomes required from a signed-in user who has none, the
// token endpoint answers the refresh with 400 `access_denied` / `mfa_enrolment_required`. The app
// has nothing to recover: it drops its tokens (ProtectedPage then sends the user through the normal
// login, where the portal shows the forced set-up step) and must not hammer the token endpoint.
describe('ApiClient when the token refresh is refused', () => {
  const refusal = Object.assign(new Error('OAuth2 error access_denied. mfa_enrolment_required'), {
    oauth2Code: 'access_denied',
    httpCode: 400,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useOAuthStore.getState().setAuth({
      accessToken: 'expired',
      refreshToken: 'refresh-1',
      accessTokenExpirationDate: Date.now() - 1000,
    });
    getNewToken.mockRejectedValue(refusal);
  });

  it('clears the tokens after a single refresh attempt and fails the request', async () => {
    const client = new ApiClient({ baseUrl: 'http://api.test' });
    const calls = stubTransport(client, [401]);

    await expect(client.request('/news')).rejects.toBeDefined();

    expect(getNewToken).toHaveBeenCalledTimes(1);
    expect(getNewToken).toHaveBeenCalledWith('refresh-1');
    expect(useOAuthStore.getState().accessToken).toBeNull();
    expect(useOAuthStore.getState().refreshToken).toBeNull();
    // Sent once, anonymously, and not retried: there is no token left to retry with
    expect(calls).toHaveLength(1);
    expect(calls[0].headers.Authorization).toBeUndefined();
  });

  it('does not refresh again for the requests that follow', async () => {
    const client = new ApiClient({ baseUrl: 'http://api.test' });
    stubTransport(client, [401]);

    await expect(client.request('/news')).rejects.toBeDefined();
    await expect(client.request('/news')).rejects.toBeDefined();

    expect(getNewToken).toHaveBeenCalledTimes(1);
  });
});
