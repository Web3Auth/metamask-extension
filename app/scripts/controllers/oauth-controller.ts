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
}

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


  constructor({
    state,
    messenger,
    loginProviderConfig,
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

    Object.entries(loginProviderConfig).forEach(([provider, config]) => {
      if (!config.scopes) {
        config.scopes = defaultProviderScopes[provider as OAuthProvider];
      }
      if (!config.redirectUri) {
        config.redirectUri = chrome.identity.getRedirectURL();
      }
    });
    this.loginProviderConfig = loginProviderConfig;
  }

  /**
   * Initiates the OAuth login process for the given provider.
   * Upon completion, return the id token.
   * @param provider - The OAuth provider to use.
   */
  async startOAuthLogin(provider: OAuthProvider): Promise<OAuthLoginResult>{
    // const authUrl = this.constructAuthUrl(provider);
    // log.debug('[OAuthController] startOAuthLogin authUrl', authUrl);
    // TODO: un-comment this when we have byoa server
    // const redirectUrl = "get_from_identity_launchWebAuthFlow";
    // const redirectUrl = await chrome.identity.launchWebAuthFlow({
    //   interactive: true,
    //   url: authUrl,
    // });
    // console.log('[identity auth redirectUrl]', redirectUrl);
    // if (!redirectUrl) {
    //   console.error('[identity auth redirectUrl is null]');
    //   throw new Error('No redirect URL found');
    // }

    return new Promise(async (resolve, reject) => {
      try {
        const tokenInfo = await this.handleOAuthResponse(provider);
        resolve(tokenInfo);
      } catch (error) {
        log.error('[OAuthController] startOAuthLogin error', error);
        reject(error);
      }
    });
  }

  private async handleOAuthResponse(provider: OAuthProvider): Promise<OAuthLoginResult> {
    // TODO: handle google/apple auth response with 'code' flow and get id token
    const authUrl = this.constructAuthUrl(provider);
    const redirectUrl = await chrome.identity.launchWebAuthFlow({
      interactive: true,
      url: authUrl,
    });

    if (!redirectUrl) {
      throw new Error('No redirect URL found');
    }

    const m = redirectUrl.match(/[#?](.*)/)
    if (!m || m.length < 1) {
      throw new Error('Invalid redirect URL');
    }
    const params = new URLSearchParams(m[1].split('#')[0])
    const accessToken = params.get('access_token')
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
    const data = await response.json()

    return {
      verifier: provider,
      idTokens: [accessToken],
      verifierID: data.email,
      endpoints: [authUrl],
      indexes: [0],
    }
  }

  private constructAuthUrl(provider: OAuthProvider): string {
    const oAuthProviderConfig = this.loginProviderConfig[provider];
    let authURL = oAuthProviderConfig.authUri;
    authURL += `?client_id=${oAuthProviderConfig.clientId}`;
    authURL += `&response_type=${encodeURIComponent(
      provider === 'google' ? 'token' : 'code',
    )}`;
    authURL += `&redirect_uri=${encodeURIComponent(
      oAuthProviderConfig.redirectUri || '',
    )}`;
    authURL += `&scope=${encodeURIComponent(
      oAuthProviderConfig.scopes?.join(' ') || '',
    )}`;

    if (provider === 'apple') {
      authURL += `&response_mode=form_post`;
      const state = Math.random().toString(36).substring(2, 15);
      authURL += `&state=${state}`;
    }

    return authURL;
  }
}
