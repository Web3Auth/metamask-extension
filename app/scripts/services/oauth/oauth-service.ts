import { AuthConnection } from '@metamask/seedless-onboarding-controller';
import { BaseLoginHandler } from './base-login-handler';
import { createLoginHandler } from './create-login-handler';
import type {
  OAuthLoginEnv,
  OAuthLoginResult,
  OAuthServiceOptions,
  WebAuthenticator,
} from './types';

const audience = 'metamask';

export default class OAuthService {
  #env: OAuthLoginEnv;

  #webAuthenticator: WebAuthenticator;

  constructor({ env, webAuthenticator }: OAuthServiceOptions) {
    this.#env = env;
    this.#webAuthenticator = webAuthenticator;
  }

  /**
   * Start the OAuth login process for the given social login type.
   *
   * @param authConnection - The social login type to login with.
   * @returns The login result.
   */
  async startOAuthLogin(
    authConnection: AuthConnection,
  ): Promise<OAuthLoginResult> {
    // get the redirect URI for the OAuth login
    const redirectUri = this.#webAuthenticator.getRedirectURL();

    // create the login handler for the given social login type
    // this is to get the Jwt Token in the exchange for the Authorization Code
    const loginHandler = createLoginHandler(
      authConnection,
      redirectUri,
      this.#env,
    );

    // launch the web auth flow to get the Authorization Code from the social login provider
    const redirectUrlFromOAuth = await new Promise<string>(
      (resolve, reject) => {
        // since promise returns aren't supported until MV3, we need to use a callback function to support MV2
        this.#webAuthenticator.launchWebAuthFlow(
          {
            interactive: true,
            url: loginHandler.getAuthUrl(),
          },
          (responseUrl) => {
            if (responseUrl) {
              resolve(responseUrl);
            } else {
              reject(new Error('No redirect URL found'));
            }
          },
        );
      },
    );

    if (!redirectUrlFromOAuth) {
      console.error('[identity auth] redirectUrl is null');
      throw new Error('No redirect URL found');
    }

    // handle the OAuth response from the social login provider and get the Jwt Token in exchange
    const loginResult = await this.#handleOAuthResponse(
      loginHandler,
      redirectUrlFromOAuth,
    );
    return loginResult;
  }

  async getNewRefreshToken({
    connection,
    refreshToken,
  }: {
    connection: AuthConnection;
    refreshToken: string;
  }): Promise<{ idTokens: string[]; refreshToken: string }> {
    const loginHandler = createLoginHandler(
      connection,
      '', // create handler for get refresh token function only, no need redirect URI
      this.#env,
    );

    const refreshTokenData = await loginHandler.refreshAuthToken(refreshToken);
    const idToken = refreshTokenData.jwt_tokens[audience];

    return {
      idTokens: [idToken],
      refreshToken: refreshTokenData.refresh_token,
    };
  }

  /**
   * Handle the OAuth response from the social login provider and get the Jwt Token in exchange.
   *
   * The Social Login Auth Server returned the Authorization Code in the redirect URL.
   * This function will extract the Authorization Code from the redirect URL,
   * use it to get the Jwt Token from the Web3Auth Authentication Server.
   *
   * @param loginHandler - The login handler to use.
   * @param redirectUrl - The redirect URL from webAuthFlow which includes the Authorization Code.
   * @returns The login result.
   */
  async #handleOAuthResponse(
    loginHandler: BaseLoginHandler,
    redirectUrl: string,
  ): Promise<OAuthLoginResult> {
    const authCode = this.#getRedirectUrlAuthCode(redirectUrl);
    if (!authCode) {
      throw new Error('No auth code found');
    }
    const res = await this.#getAuthIdToken(loginHandler, authCode);
    return res;
  }

  /**
   * Get the Jwt Token from the Web3Auth Authentication Server.
   *
   * @param loginHandler - The login handler to use.
   * @param authCode - The Authorization Code from the social login provider.
   * @returns The login result.
   */
  async #getAuthIdToken(
    loginHandler: BaseLoginHandler,
    authCode: string,
  ): Promise<OAuthLoginResult> {
    const { authConnectionId, groupedAuthConnectionId } = this.#env;

    const authTokenData = await loginHandler.getAuthIdToken(authCode);
    const idToken = authTokenData.jwt_tokens[audience];
    const userInfo = await loginHandler.getUserInfo(idToken);

    return {
      authConnectionId,
      groupedAuthConnectionId,
      userId: userInfo.sub,
      idTokens: [idToken],
      authConnection: loginHandler.authConnection,
      socialLoginEmail: userInfo.email,
      refreshToken: authTokenData.refresh_token,
    };
  }

  #getRedirectUrlAuthCode(redirectUrl: string): string | null {
    const url = new URL(redirectUrl);
    return url.searchParams.get('code');
  }
}
