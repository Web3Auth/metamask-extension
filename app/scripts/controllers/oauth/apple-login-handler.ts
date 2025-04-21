import { BaseLoginHandler } from './base-login-handler';
import { LoginHandlerOptions, AuthConnection, OAuthUserInfo } from './types';

export class AppleLoginHandler extends BaseLoginHandler {
  public readonly PROVIDER = 'apple';

  readonly #scope = ['name', 'email'];

  protected serverRedirectUri: string;

  constructor(options: LoginHandlerOptions) {
    super(options);

    if (options.provider !== AuthConnection.Apple) {
      throw new Error(
        `Provider mistmatch. Expected Apple, got ${options.provider}`,
      );
    }

    if (options.serverRedirectUri) {
      this.serverRedirectUri = options.serverRedirectUri;
    } else {
      this.serverRedirectUri = `${options.authServerUrl}/api/v1/oauth/callback`;
    }
  }

  get scope() {
    return this.#scope;
  }

  getAuthUrl(): string {
    const authUrl = this.finalUrl;

    authUrl.searchParams.set('redirect_uri', this.serverRedirectUri);
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('nonce', this.#generateNonce());
    authUrl.searchParams.set('scope', this.#scope.join(' '));

    return authUrl.toString();
  }

  async getUserInfo(idToken: string): Promise<OAuthUserInfo> {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/u, '+').replace(/_/u, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.email,
      sub: payload.sub,
    };
  }

  #generateNonce(): string {
    return Math.random().toString(16).substring(2, 15);
  }
}
