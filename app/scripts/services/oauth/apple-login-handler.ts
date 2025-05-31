import { AuthConnection } from '@metamask/seedless-onboarding-controller';
import { sha512 } from '@noble/hashes/sha2';
import { bytesToHex, remove0x } from '@metamask/utils';
import { BaseLoginHandler } from './base-login-handler';
import { AuthTokenResponse, LoginHandlerOptions, OAuthUserInfo } from './types';

export class AppleLoginHandler extends BaseLoginHandler {
  public readonly OAUTH_SERVER_URL = 'https://appleid.apple.com/auth/authorize';

  readonly #scope = ['name', 'email'];

  protected serverRedirectUri: string;

  constructor(options: LoginHandlerOptions) {
    super(options);

    if (options.serverRedirectUri) {
      this.serverRedirectUri = options.serverRedirectUri;
    } else {
      this.serverRedirectUri = `${options.authServerUrl}/api/v1/oauth/callback`;
    }
  }

  get authConnection() {
    return AuthConnection.Apple;
  }

  get scope() {
    return this.#scope;
  }

  /**
   * Generate the Auth URL to initiate the OAuth login to get the Authorization Code from Apple ID server.
   *
   * @returns The URL to initiate the OAuth login.
   */
  getAuthUrl(): string {
    const authUrl = new URL(this.OAUTH_SERVER_URL);
    authUrl.searchParams.set('client_id', this.options.oAuthClientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', this.serverRedirectUri);
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('prompt', this.prompt);
    // required for custom flow where apple oauth will send post request to redirect_uri after client init authz
    // ref: https://github.com/MetaMask/threatmodels/pull/38
    authUrl.searchParams.set(
      'state',
      JSON.stringify({
        client_redirect_back_uri: this.options.redirectUri,
        hashed_nonce: this.#getHashedNonce(),
      }),
    );
    authUrl.searchParams.set('scope', this.#scope.join(' '));

    return authUrl.toString();
  }

  #getHashedNonce(): string {
    const hashBytes = sha512(this.nonce);
    return remove0x(bytesToHex(hashBytes));
  }

  /**
   * Get the JWT Token from the Web3Auth Authentication Server.
   *
   * @param _state - The Authorization state from the social login provider.
   * @returns The JWT Token from the Web3Auth Authentication Server.
   */
  async getAuthIdToken(_state?: string): Promise<AuthTokenResponse> {
    const requestData = this.generateAuthTokenRequestData();
    const res = await this.requestVerifyAuthToken(requestData);
    return res;
  }

  /**
   * Get the state from the redirect URL.
   * Apple doesn't support pkce so we use custom flow.
   * ref: https://github.com/MetaMask/threatmodels/pull/38
   *
   * @param redirectUrl - The redirect URL from the social login provider.
   * @returns The state from the redirect URL.
   */
  getRedirectUrlAuthCode(redirectUrl: string): string | null {
    const url = new URL(redirectUrl);
    const state = url.searchParams.get('state');
    return state ? JSON.parse(state).hashed_nonce : null;
  }

  /**
   * Generate the request body data to get the JWT Token from the Web3Auth Authentication Server.
   *
   * @returns The request data for the Web3Auth Authentication Server.
   */
  generateAuthTokenRequestData(): string {
    const { web3AuthNetwork } = this.options;
    const requestData = {
      state_nonce: this.nonce,
      client_id: this.options.oAuthClientId,
      redirect_uri: this.serverRedirectUri,
      login_provider: this.authConnection,
      network: web3AuthNetwork,
    };

    return JSON.stringify(requestData);
  }

  async requestVerifyAuthToken(
    requestData: string,
  ): Promise<AuthTokenResponse> {
    const res = await fetch(
      `${this.options.authServerUrl}/api/v1/oauth/callback/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestData,
      },
    );

    const data = await res.json();
    return data;
  }

  /**
   * Get the user's information from the JWT Token.
   *
   * @param idToken - The JWT Token from the Web3Auth Authentication Server.
   * @returns The user's information from the JWT Token.
   */
  async getUserInfo(idToken: string): Promise<OAuthUserInfo> {
    const jsonPayload = this.decodeIdToken(idToken);
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.email,
      sub: payload.sub,
    };
  }
}
