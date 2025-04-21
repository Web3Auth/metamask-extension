import { AppleLoginHandler } from './apple-login-handler';
import { GoogleLoginHandler } from './google-login-handler';
import { OAuthLoginEnv, OAuthProvider } from './types';

export function createLoginHandler(
  provider: OAuthProvider,
  redirectUri: string,
  env: OAuthLoginEnv,
) {
  const commonHandlerOptions = {
    provider,
    web3AuthNetwork: env.web3AuthNetwork,
    redirectUri,
    authServerUrl: env.authServerUrl,
  };

  switch (provider) {
    case OAuthProvider.Google:
      return new GoogleLoginHandler({
        ...commonHandlerOptions,
        oAuthClientId: env.googleClientId,
        oAuthServerUrl: env.googleAuthUri,
      });
    case OAuthProvider.Apple:
      return new AppleLoginHandler({
        ...commonHandlerOptions,
        oAuthClientId: env.appleClientId,
        oAuthServerUrl: env.appleAuthUri,
        serverRedirectUri: env.serverRedirectUri,
      });
    default:
      throw new Error('Invalid provider');
  }
}
