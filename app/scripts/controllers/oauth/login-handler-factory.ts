import { AuthConnection } from '../../../../shared/constants/oauth';
import { AppleLoginHandler } from './apple-login-handler';
import { GoogleLoginHandler } from './google-login-handler';
import { OAuthLoginEnv } from './types';

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
        oAuthServerUrl: env.googleAuthUri,
      });
    case AuthConnection.Apple:
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
