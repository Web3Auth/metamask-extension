import { AuthConnection } from '@metamask/seedless-onboarding-controller';
import { BaseLoginHandler } from './base-login-handler';
import { LoginHandlerOptions, OAuthUserInfo } from './types';

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

  getAuthUrl(): string {
    const authUrl = new URL(this.OAUTH_SERVER_URL);
    authUrl.searchParams.set('client_id', this.options.oAuthClientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', this.serverRedirectUri);
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('nonce', this.nonce);
    authUrl.searchParams.set('scope', this.#scope.join(' '));

    return authUrl.toString();
  }

  async getAuthIdToken(code: string) {
    const requestData = this.generateAuthTokenRequestData(code);
    const res = await this.requestAuthToken(requestData);
    return res;
  }

  generateAuthTokenRequestData(code: string) {
    const { serverRedirectUri, web3AuthNetwork } = this.options;
    const requestData = {
      code,
      client_id: this.options.oAuthClientId,
      redirect_uri: serverRedirectUri,
      login_provider: this.authConnection,
      network: web3AuthNetwork,
    };

    return JSON.stringify(requestData);
  }

  async getUserInfo(idToken: string): Promise<OAuthUserInfo> {
    const jsonPayload = this.decodeIdToken(idToken);
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.email,
      sub: payload.sub,
    };
  }
}
