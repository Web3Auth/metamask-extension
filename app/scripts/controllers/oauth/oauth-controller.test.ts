import { Web3AuthNetwork } from '@metamask/seedless-onboarding-controller';
import { AuthConnection } from '../../../../shared/constants/oauth';
import OAuthController, {
  getDefaultOAuthControllerState,
} from './oauth-controller';
import { OAuthControllerMessenger } from './types';
import { createLoginHandler } from './login-handler-factory';

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
const OAUTH_AUD = 'metamask';

function getOAuthLoginEnvs() {
  return {
    googleClientId: DEFAULT_GOOGLE_CLIENT_ID,
    googleAuthUri: DEFAULT_GOOGLE_AUTH_URI,
    appleClientId: DEFAULT_APPLE_CLIENT_ID,
    appleAuthUri: DEFAULT_APPLE_AUTH_URI,
    authServerUrl: process.env.AUTH_SERVER_URL as string,
    web3AuthNetwork: process.env.WEB3AUTH_NETWORK as Web3AuthNetwork,
  };
}

describe('OAuthController', () => {
  const messenger = buildOAuthControllerMessenger();
  let launchWebAuthFlowSpy: jest.SpyInstance;

  beforeEach(() => {
    // mock chrome.identity.launchWebAuthFlow to return a mocked redirect URI with a mocked code
    launchWebAuthFlowSpy = jest
      .spyOn(chrome.identity, 'launchWebAuthFlow')
      .mockResolvedValueOnce('https://mocked-redirect-uri?code=mocked-code');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start the OAuth login process with `Google`', async () => {
    const userId = 'user-id';
    const idTokens = ['id-token'];

    const controller = new OAuthController({
      messenger,
      state: getDefaultOAuthControllerState(),
      env: getOAuthLoginEnvs(),
    });

    // mock the fetch call to auth-server
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        verifier_id: userId,
        jwt_tokens: {
          [OAUTH_AUD]: idTokens[0],
        },
      }),
    });
    await controller.startOAuthLogin(AuthConnection.Google);

    const googleLoginHandler = createLoginHandler(
      AuthConnection.Google,
      chrome.identity.getRedirectURL(),
      getOAuthLoginEnvs(),
    );

    expect(launchWebAuthFlowSpy).toHaveBeenCalledWith({
      interactive: true,
      url: googleLoginHandler.getAuthUrl(),
    });
    expect(controller.state.provider).toBe(AuthConnection.Google);
  });

  it('should start the OAuth login process with `Apple`', async () => {
    const userId = 'apple-user-id';
    const idTokens = ['id-token'];

    const controller = new OAuthController({
      messenger,
      state: getDefaultOAuthControllerState(),
      env: getOAuthLoginEnvs(),
    });

    // mock the fetch call to auth-server
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        verifier_id: userId,
        jwt_tokens: {
          [OAUTH_AUD]: idTokens[0],
        },
      }),
    });
    // mock the Math.random to return a fixed value nonce
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.1);

    await controller.startOAuthLogin(AuthConnection.Apple);

    const appleLoginHandler = createLoginHandler(
      AuthConnection.Apple,
      chrome.identity.getRedirectURL(),
      getOAuthLoginEnvs(),
    );

    expect(launchWebAuthFlowSpy).toHaveBeenCalledWith({
      interactive: true,
      url: appleLoginHandler.getAuthUrl(),
    });

    expect(controller.state.provider).toBe(AuthConnection.Apple);
  });
});
