import { BaseLoginHandler } from './base-login-handler';
import { LoginHandlerOptions, OAuthProvider, OAuthUserInfo } from './types';

export class GoogleLoginHandler extends BaseLoginHandler {
  constructor(options: LoginHandlerOptions) {
    super(options);

    if (options.provider !== OAuthProvider.Google) {
      throw new Error(
        `Provider mistmatch. Expected Google, got ${options.provider}`,
      );
    }
  }

  getAuthUrl(): string {
    const finalAuthUrl = this.finalUrl;
    finalAuthUrl.searchParams.set('redirect_uri', this.options.redirectUri);
    return finalAuthUrl.toString();
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
}
