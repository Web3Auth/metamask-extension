import { Messenger } from "@metamask/base-controller";
import OAuthController, { getDefaultOAuthControllerState, OAuthControllerMessenger, OAuthProvider, OAuthProviderConfig, Web3AuthNetwork } from "./oauth-controller";

function buildOAuthControllerMessenger() {
  return {
    call: jest.fn(),
    publish: jest.fn(),
    registerActionHandler: jest.fn(),
    registerInitialEventPayload: jest.fn(),
    subscribe: jest.fn(),
  } as unknown as jest.Mocked<OAuthControllerMessenger>;
}

const DEFAULT_GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const DEFAULT_GOOGLE_AUTH_URI = process.env.GOOGLE_AUTH_URI as string;
const DEFAULT_APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID as string;
const DEFAULT_APPLE_AUTH_URI = process.env.APPLE_AUTH_URI as string;

function getLoginProviderConfig() {
  return {
    google: {
      clientId: DEFAULT_GOOGLE_CLIENT_ID,
      authUri: DEFAULT_GOOGLE_AUTH_URI,
    },
    apple: {
      clientId: DEFAULT_APPLE_CLIENT_ID,
      authUri: DEFAULT_APPLE_AUTH_URI,
    },
  }
}

function getMockedRedirectURI(providerConfig: OAuthProviderConfig, redirectUri: string, additionalParams: Record<string, string> = {}) {
  const baseUrl = providerConfig.authUri;
  const clientId = providerConfig.clientId;
  const responseType = 'code';

  const url = new URL(baseUrl);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', responseType);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', providerConfig.scopes?.join(' ') || '');
  Object.entries(additionalParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.href;
}

describe('OAuthController', () => {
  const messenger = buildOAuthControllerMessenger();
  let launchWebAuthFlowSpy: jest.SpyInstance;

  beforeEach(() => {
    // mock chrome.identity.launchWebAuthFlow to return a mocked redirect URI with a mocked code
    launchWebAuthFlowSpy = jest.spyOn(chrome.identity, 'launchWebAuthFlow').mockResolvedValueOnce('https://mocked-redirect-uri?code=mocked-code');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start the OAuth login process with `Google`', async () => {
    const authConnectionId = 'byoa-server';
    const groupedAuthConnectionId = 'mm-seedless-onboarding';
    const userId = 'user-id';
    const idTokens = ['id-token'];

    const controller = new OAuthController({
      messenger,
      state: getDefaultOAuthControllerState(),
      loginProviderConfig: getLoginProviderConfig(),
      byoaServerUrl: process.env.BYOA_SERVER_URL as string,
      web3AuthNetwork: process.env.WEB3AUTH_NETWORK as Web3AuthNetwork,
    });

    // mock the fetch call to byoa-server
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        verifier_id: userId,
        jwt_tokens: {
          [controller.OAuthAud]: idTokens[0],
        }
      }),
    });
    await controller.startOAuthLogin(OAuthProvider.Google);

    expect(launchWebAuthFlowSpy).toHaveBeenCalledWith({
      interactive: true,
      url: getMockedRedirectURI(controller.loginProviderConfig.google, chrome.identity.getRedirectURL()),
    });

    expect(controller.state.authConnectionId).toBe(authConnectionId);
    expect(controller.state.groupedAuthConnectionId).toBe(groupedAuthConnectionId);
    expect(controller.state.userId).toBe(userId);
    expect(controller.state.provider).toBe(OAuthProvider.Google);
  });

  it('should start the OAuth login process with `Apple`', async () => {
    const authConnectionId = 'byoa-server';
    const groupedAuthConnectionId = 'mm-seedless-onboarding';
    const userId = 'apple-user-id';
    const idTokens = ['id-token'];

    const controller = new OAuthController({
      messenger,
      state: getDefaultOAuthControllerState(),
      loginProviderConfig: getLoginProviderConfig(),
      byoaServerUrl: process.env.BYOA_SERVER_URL as string,
      web3AuthNetwork: process.env.WEB3AUTH_NETWORK as Web3AuthNetwork,
    });

    // mock the fetch call to byoa-server
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        verifier_id: userId,
        jwt_tokens: {
          [controller.OAuthAud]: idTokens[0],
        }
      }),
    });
    // mock the Math.random to return a fixed value nonce
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.1);


    await controller.startOAuthLogin(OAuthProvider.Apple);

    const redirectUri = `${process.env.BYOA_SERVER_URL}/api/v1/oauth/callback`;

    expect(launchWebAuthFlowSpy).toHaveBeenCalledWith({
      interactive: true,
      url: getMockedRedirectURI(controller.loginProviderConfig.apple, redirectUri, {
        response_mode: 'form_post',
        state: JSON.stringify({
          client_redirect_back_uri: chrome.identity.getRedirectURL(),
        }),
        nonce: 0.1.toString(16).substring(2, 15),
      }),
    });

    expect(controller.state.authConnectionId).toBe(authConnectionId);
    expect(controller.state.groupedAuthConnectionId).toBe(groupedAuthConnectionId);
    expect(controller.state.userId).toBe(userId);
    expect(controller.state.provider).toBe(OAuthProvider.Apple);
  });
});
