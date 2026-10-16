import { generateCodeVerifier, OAuth2Client } from '@badgateway/oauth2-client';

export const VERIFIER_STORAGE = 'auth-store';

const oauthClient = new OAuth2Client({
  server: `${import.meta.env["VITE_API_URL"]}`,
  clientId: `${import.meta.env["VITE_OAUTH_CLIENT_ID"]}`,
  tokenEndpoint: '/oauth2/token',
  authorizationEndpoint: '/oauth2/authorize',
});


const getAuthorizationUrl = async (extraParams?: Record<string, string>) => {
  const codeVerifier = await generateCodeVerifier();
  localStorage.setItem(VERIFIER_STORAGE, codeVerifier);
  return oauthClient.authorizationCode.getAuthorizeUri({
    redirectUri: `${window.location.origin}/login/callback`,
    codeVerifier,
    state: 'state',
    scope: ['openid', 'offline_access'],
    extraParams
  })
};


const getTokensFromCodeRedirect = async (url: string) => {
  const codeVerifier = localStorage.getItem(VERIFIER_STORAGE);
  if(!codeVerifier) {
    throw new Error('Code verifier not found in local storage. Please initiate the OAuth flow first.');
  }

  return oauthClient.authorizationCode.getTokenFromCodeRedirect(url, {
    redirectUri: `${window.location.origin}/login/callback`,
    codeVerifier,
  });
}

const getNewToken = async (refreshToken: string) => {
  console.log("refreshing with", refreshToken);
  return oauthClient.refreshToken({
    refreshToken: refreshToken,
    accessToken: "",
    expiresAt: null
  });
}


export {
  getAuthorizationUrl,
  getTokensFromCodeRedirect,
  getNewToken
}
