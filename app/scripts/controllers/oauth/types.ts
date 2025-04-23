import {
  ControllerGetStateAction,
  ControllerStateChangeEvent,
  RestrictedMessenger,
} from '@metamask/base-controller';
import { Web3AuthNetwork } from '@metamask/seedless-onboarding-controller';
import { AuthConnection } from '../../../../shared/constants/oauth';

export const controllerName = 'OAuthController';

export type LoginHandlerOptions = {
  oAuthClientId: string;
  authServerUrl: string;
  web3AuthNetwork: Web3AuthNetwork;
  redirectUri: string;
  scopes?: string[];
  /**
   * The server redirect URI to use for the OAuth login.
   * This is the URI that the OAuth provider will redirect to after the user has logged in.
   * This is required for Apple login.
   */
  serverRedirectUri?: string;
};

/**
 * The state of the {@link OAuthController}
 */
export type OAuthControllerState = {
  // OAuth Controller is stateless
};

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

export type OAuthProviderConfig = {
  clientId: string;
  redirectUri?: string;
  /** for apple, we need to redirect to a server endpoint that will handle the post request and redirect back to client */
  serverRedirectUri?: string;
  scopes?: string[];
};

export type OAuthLoginEnv = {
  authConnectionId: string;
  groupedAuthConnectionId: string;
  googleClientId: string;
  appleClientId: string;
  authServerUrl: string;
  web3AuthNetwork: Web3AuthNetwork;
  serverRedirectUri?: string;
};

export type OAuthControllerOptions = {
  state: Partial<OAuthControllerState>;
  messenger: OAuthControllerMessenger;
  env: OAuthLoginEnv;
};

export type AuthTokenResponse = {
  success: boolean;
  message: string;
  jwt_tokens: Record<string, string>;
};

export type OAuthLoginResult = {
  authConnection: AuthConnection;
  authConnectionId: string;
  groupedAuthConnectionId: string;
  userId: string;
  idTokens: string[];
  socialLoginEmail: string;
};

export type OAuthUserInfo = {
  email: string;
  sub: string;
};
