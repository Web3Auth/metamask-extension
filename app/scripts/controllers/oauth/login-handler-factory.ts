import { AppleLoginHandler } from './apple-login-handler';
import { GoogleLoginHandler } from './google-login-handler';
import { OAuthLoginEnv, AuthConnection } from './types';

export function createLoginHandler(
  provider: AuthConnection,
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
    case AuthConnection.Google:
      return new GoogleLoginHandler({
        ...commonHandlerOptions,
        oAuthClientId: env.googleClientId,
      });
    case AuthConnection.Apple:
      return new AppleLoginHandler({
        ...commonHandlerOptions,
        oAuthClientId: env.appleClientId,
        serverRedirectUri: env.serverRedirectUri,
      });
    default:
      throw new Error('Invalid provider');
  }
}
