import { AuthConnection } from '../../../../shared/constants/oauth';
import { BaseLoginHandler } from './base-login-handler';
import { OAuthUserInfo } from './types';

export class GoogleLoginHandler extends BaseLoginHandler {
  // This prompt value is used to force the user to select an account before OAuth login
  readonly #prompt = 'select_account';

  public readonly OAUTH_SERVER_URL =
    'https://accounts.google.com/o/oauth2/v2/auth';

  readonly #scope = ['openid', 'profile', 'email'];

  get authConnection() {
    return AuthConnection.Google;
  }

  get scope() {
    return this.#scope;
  }

  getAuthUrl(): string {
    const authUrl = new URL(this.OAUTH_SERVER_URL);
    authUrl.searchParams.set('client_id', this.options.oAuthClientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.#scope.join(' '));
    authUrl.searchParams.set('redirect_uri', this.options.redirectUri);
    authUrl.searchParams.set('nonce', this.nonce);
    authUrl.searchParams.set('prompt', this.#prompt);

    return authUrl.toString();
  }

  async getAuthIdToken(code: string) {
    const requestData = this.generateAuthTokenRequestData(code);
    const res = await this.requestAuthToken(requestData);
    return res;
  }

  generateAuthTokenRequestData(code: string) {
    const { redirectUri, web3AuthNetwork } = this.options;
    const requestData = {
      code,
      client_id: this.options.oAuthClientId,
      redirect_uri: redirectUri,
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
