import { BaseController } from '@metamask/base-controller';
import { AuthConnection } from '../../../../shared/constants/oauth';
import {
  controllerName,
  OAuthControllerMessenger,
  OAuthControllerOptions,
  OAuthControllerState,
  OAuthLoginEnv,
  OAuthLoginResult,
} from './types';
import { createLoginHandler } from './login-handler-factory';
import { BaseLoginHandler } from './base-login-handler';

/**
 * Function to get default state of the {@link OAuthController}.
 */
export const getDefaultOAuthControllerState =
  (): Partial<OAuthControllerState> => ({});

export default class OAuthController extends BaseController<
  typeof controllerName,
  OAuthControllerState,
  OAuthControllerMessenger
> {
  #env: OAuthLoginEnv;

  #redirectUri: string;

  readonly #OAuthAud = 'metamask';

  constructor({ state, messenger, env }: OAuthControllerOptions) {
    super({
      messenger,
      metadata: {}, // OAuth Controller is stateless and does not need metadata
      name: controllerName,
      state: {
        ...getDefaultOAuthControllerState(),
        ...state,
      },
    });

    this.#env = env;

    this.#redirectUri = chrome.identity.getRedirectURL();
  }

  async startOAuthLogin(provider: AuthConnection): Promise<OAuthLoginResult> {
    const loginHandler = createLoginHandler(
      provider,
      this.#redirectUri,
      this.#env,
    );

    const redirectUrl = await chrome.identity.launchWebAuthFlow({
      interactive: true,
      url: loginHandler.getAuthUrl(),
    });

    if (!redirectUrl) {
      console.error('[identity auth] redirectUrl is null');
      throw new Error('No redirect URL found');
    }

    const loginResult = await this.#handleOAuthResponse(
      loginHandler,
      redirectUrl,
    );
    return loginResult;
  }

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

  async #getAuthIdToken(
    loginHandler: BaseLoginHandler,
    authCode: string,
  ): Promise<OAuthLoginResult> {
    const { authConnectionId, groupedAuthConnectionId } = this.#env;
    const authTokenData = await loginHandler.getAuthIdToken(authCode);
    const idToken = authTokenData.jwt_tokens[this.#OAuthAud];
    const userInfo = await loginHandler.getUserInfo(idToken);

    return {
      authConnectionId,
      groupedAuthConnectionId,
      userId: userInfo.sub,
      idTokens: [idToken],
      authConnection: loginHandler.authConnection,
      socialLoginEmail: userInfo.email,
    };
  }

  #getRedirectUrlAuthCode(redirectUrl: string): string | null {
    const url = new URL(redirectUrl);
    return url.searchParams.get('code');
  }
}
