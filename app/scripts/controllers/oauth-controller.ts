import {
  BaseController,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
  RestrictedMessenger,
} from '@metamask/base-controller';
import log from 'loglevel';

// Unique name for the controller
const controllerName = 'OAuthController';

export type OAuthProvider = 'google' | 'apple';

/**
 * The state of the {@link OAuthController}
 */
// TODO: do we actually need the state? If not, remove it
export type OAuthControllerState = {
  authLoading: boolean;
  verifier?: OAuthProvider;
  idToken?: string;
  verifier_id?: string;
};

/**
 * Function to get default state of the {@link OAuthController}.
 */
export const getDefaultOAuthControllerState = (): OAuthControllerState => ({
  authLoading: false,
});

export type OAuthControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  OAuthControllerState
>;

export type OAuthControllerActions = OAuthControllerGetStateAction;

export type OAuthControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  OAuthControllerState
>;

export type OAuthControllerControllerEvents = OAuthControllerStateChangeEvent;

/**
 * Actions that this controller is allowed to call.
 */
export type AllowedActions = never;

/**
 * Events that this controller is allowed to subscribe.
 */
export type AllowedEvents = never;

export type OAuthControllerMessenger = RestrictedMessenger<
  typeof controllerName,
  OAuthControllerActions | AllowedActions,
  OAuthControllerControllerEvents | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;

const defaultProviderScopes = {
  google: ['openid', 'email', 'profile'],
  apple: ['name', 'email'],
};

export type OAuthProviderConfig = {
  clientId: string;
  redirectUri?: string;
  /** for apple, we need to redirect to a server endpoint that will handle the post request and redirect back to client */
  serverRedirectUri?: string;
  authUri: string;
  scopes?: string[];
};

export type LoginProviderConfig = {
  google: OAuthProviderConfig;
  apple: OAuthProviderConfig;
};

export type OAuthControllerOptions = {
  state: Partial<OAuthControllerState>;
  messenger: OAuthControllerMessenger;
  loginProviderConfig: LoginProviderConfig;
  byoaServerUrl: string;
  web3AuthNetwork: string;
};

export type OAuthLoginResult = {
  verifier: OAuthProvider;
  idTokens: string[];
  verifierID: string;
  endpoints: string[];
  indexes: number[];
};

/**
 * {@link OAuthController}'s metadata.
 *
 * This allows us to choose if fields of the state should be persisted or not
 * using the `persist` flag; and if they can be sent to Sentry or not, using
 * the `anonymous` flag.
 */
const controllerMetadata = {
  authLoading: {
    persist: false,
    anonymous: true,
  },
  verifier: {
    persist: true,
    anonymous: true,
  },
  idToken: {
    persist: false,
    anonymous: true,
  },
  verifier_id: {
    persist: false,
    anonymous: true,
  },
};

// const REDIRECT_PATH = '/oauth-redirect';

/**
 * Controller responsible for maintaining
 * state related to OAuth
 */
export default class OAuthController extends BaseController<
  typeof controllerName,
  OAuthControllerState,
  OAuthControllerMessenger
> {
  private loginProviderConfig: LoginProviderConfig;

  private byoaServerUrl: string;

  private web3AuthNetwork: string;

  constructor({
    state,
    messenger,
    loginProviderConfig,
    byoaServerUrl,
    web3AuthNetwork,
  }: OAuthControllerOptions) {
    super({
      messenger,
      metadata: controllerMetadata,
      name: controllerName,
      state: {
        ...getDefaultOAuthControllerState(),
        ...state,
      },
    });

    this.byoaServerUrl = byoaServerUrl;
    this.web3AuthNetwork = web3AuthNetwork;

    Object.entries(loginProviderConfig).forEach(([provider, config]) => {
      if (!config.scopes) {
        config.scopes = defaultProviderScopes[provider as OAuthProvider];
      }
      if (!config.redirectUri) {
        config.redirectUri = chrome.identity.getRedirectURL();
      }
      if (!config.serverRedirectUri && provider === 'apple') {
        config.serverRedirectUri = `${this.byoaServerUrl}/api/v1/oauth/callback`;
      }
    });
    this.loginProviderConfig = loginProviderConfig;
  }

  /**
   * Initiates the OAuth login process for the given provider.
   * Upon completion, return the id token.
   *
   * @param provider - The OAuth provider to use.
   */
  async startOAuthLogin(provider: OAuthProvider): Promise<OAuthLoginResult> {
    const authUrl = this.#constructAuthUrl(provider);
    log.debug('[OAuthController] startOAuthLogin authUrl', authUrl);
    const redirectUrl = await chrome.identity.launchWebAuthFlow({
      interactive: true,
      url: authUrl,
    });
    console.log('[identity auth redirectUrl]', redirectUrl);
    if (!redirectUrl) {
      console.error('[identity auth redirectUrl is null]');
      throw new Error('No redirect URL found');
    }

    return new Promise((resolve, reject) => {
      this.#handleOAuthResponse(redirectUrl, provider)
        .then((idToken) => {
          resolve(idToken);
        })
        .catch((error) => {
          log.error('[OAuthController] startOAuthLogin error', error);
          reject(error);
        });
    });
  }

  #getProviderConfig(provider: OAuthProvider): OAuthProviderConfig {
    return this.loginProviderConfig[provider];
  }

  async #handleOAuthResponse(
    redirectUrl: string,
    provider: OAuthProvider,
  ): Promise<OAuthLoginResult> {
    const authCode = this.#getRedirectUrlAuthCode(redirectUrl);
    if (!authCode) {
      throw new Error('No auth code found');
    }
    const idToken = await this.#getBYOAIdToken(provider, authCode);
    return idToken;
  }

  async #getBYOAIdToken(
    provider: OAuthProvider,
    authCode: string,
  ): Promise<OAuthLoginResult> {
    const providerConfig = this.#getProviderConfig(provider);
    const res = await fetch(`${this.byoaServerUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: authCode,
        client_id: providerConfig.clientId,
        redirect_uri:
          provider === 'apple'
            ? providerConfig.serverRedirectUri
            : providerConfig.redirectUri,
        login_provider: provider,
        network: this.web3AuthNetwork,
      }),
    });
    const data = await res.json();
    return {
      verifier: provider,
      idTokens: [data.id_token],
      verifierID: data.verifier_id,
      // TODO: add JWKS endpoint in BYOA server for verification of id token
      endpoints: [`${this.byoaServerUrl}/.well-known/keys.json`],
      indexes: [1],
    };
  }

  #getRedirectUrlAuthCode(redirectUrl: string): string | null {
    const url = new URL(redirectUrl);
    return url.searchParams.get('code');
  }

  #constructAuthUrl(provider: OAuthProvider): string {
    const oAuthProviderConfig = this.#getProviderConfig(provider);
    const authURL = new URL(oAuthProviderConfig.authUri);
    authURL.searchParams.set('client_id', oAuthProviderConfig.clientId);
    authURL.searchParams.set('response_type', 'code');
    authURL.searchParams.set(
      'redirect_uri',
      provider === 'apple'
        ? oAuthProviderConfig.serverRedirectUri || ''
        : oAuthProviderConfig.redirectUri || '',
    );
    authURL.searchParams.set(
      'scope',
      oAuthProviderConfig.scopes?.join(' ') || '',
    );

    if (provider === 'apple') {
      // apple need to use form post response mode for code response type
      // https://developer.apple.com/documentation/sign_in_with_apple/incorporating-sign-in-with-apple-into-other-platforms#Handle-the-response
      authURL.searchParams.set('response_mode', 'form_post');
      const nonce = Math.random().toString(16).substring(2, 15);
      const dataState = JSON.stringify({
        client_redirect_back_uri: oAuthProviderConfig.redirectUri,
      });
      authURL.searchParams.set('state', dataState);
      authURL.searchParams.set('nonce', nonce);
    }

    return authURL.href;
  }
}
