import { BaseController, StateMetadata } from '@metamask/base-controller';
import log from 'loglevel';
import {
  controllerName,
  OAuthControllerMessenger,
  OAuthControllerOptions,
  OAuthControllerState,
  OAuthLoginEnv,
  OAuthLoginResult,
  OAuthProvider,
} from './types';
import { createLoginHandler } from './login-handler-factory';
import { BaseLoginHandler } from './base-login-handler';

/**
 * Function to get default state of the {@link OAuthController}.
 */
export const getDefaultOAuthControllerState =
  (): Partial<OAuthControllerState> => ({});

/**
 * {@link OAuthController}'s metadata.
 *
 * This allows us to choose if fields of the state should be persisted or not
 * using the `persist` flag; and if they can be sent to Sentry or not, using
 * the `anonymous` flag.
 */
const controllerMetadata: StateMetadata<OAuthControllerState> = {
  socialLoginEmail: {
    persist: true,
    anonymous: true,
  },
  provider: {
    persist: true,
    anonymous: true,
  },
};

export default class OAuthController extends BaseController<
  typeof controllerName,
  OAuthControllerState,
  OAuthControllerMessenger
> {
  #env: OAuthLoginEnv;

  #redirectUri: string;

  readonly #OAuthAud = 'metamask';

  readonly #AuthConnectionId = 'byoa-server';

  readonly #GroupedAuthConnectionId = 'mm-seedless-onboarding';

  constructor({ state, messenger, env }: OAuthControllerOptions) {
    super({
      messenger,
      metadata: controllerMetadata,
      name: controllerName,
      state: {
        ...getDefaultOAuthControllerState(),
        ...state,
      },
    });

    this.#env = env;

    this.#redirectUri = chrome.identity.getRedirectURL();
  }

  async startOAuthLogin(provider: OAuthProvider): Promise<OAuthLoginResult> {
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
      console.error('[identity auth redirectUrl is null]');
      throw new Error('No redirect URL found');
    }

    return new Promise((resolve, reject) => {
      this.#handleOAuthResponse(loginHandler, redirectUrl)
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          log.error('[OAuthController] startOAuthLogin error', error);
          reject(error);
        });
    });
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
    const authTokenData = await loginHandler.getAuthIdToken(authCode);
    const idToken = authTokenData.jwt_tokens[this.#OAuthAud];
    const userInfo = await loginHandler.getUserInfo(idToken);

    this.update((state) => {
      state.provider = loginHandler.provider;
      state.socialLoginEmail = userInfo.email;
    });

    return {
      authConnectionId: this.#AuthConnectionId,
      groupedAuthConnectionId: this.#GroupedAuthConnectionId,
      userId: userInfo.email,
      idTokens: [idToken],
    };
  }

  #getRedirectUrlAuthCode(redirectUrl: string): string | null {
    const url = new URL(redirectUrl);
    return url.searchParams.get('code');
  }
}
