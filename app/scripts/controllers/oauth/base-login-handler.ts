import {
  OAuthProvider,
  LoginHandlerOptions,
  AuthTokenResponse,
  OAuthUserInfo,
} from './types';

export function getDefaultScopes(provider: OAuthProvider) {
  switch (provider) {
    case OAuthProvider.Google:
      return ['openid', 'email', 'profile'];
    case OAuthProvider.Apple:
      return ['name', 'email'];
    default:
      throw new Error('Invalid provider');
  }
}

export abstract class BaseLoginHandler {
  public options: LoginHandlerOptions;

  public finalUrl: URL;

  constructor(options: LoginHandlerOptions) {
    this.options = options;

    this.finalUrl = new URL(this.options.oAuthServerUrl);
    this.finalUrl.searchParams.set('client_id', this.options.oAuthClientId);
    this.finalUrl.searchParams.set('response_type', 'code');

    if (this.options.scopes) {
      this.finalUrl.searchParams.set('scope', this.options.scopes.join(' '));
    } else {
      this.finalUrl.searchParams.set(
        'scope',
        getDefaultScopes(this.options.provider).join(' '),
      );
    }
  }

  get provider() {
    return this.options.provider;
  }

  async getAuthIdToken(code: string): Promise<AuthTokenResponse> {
    const res = await fetch(
      `${this.options.authServerUrl}/api/v1/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: this.generateAuthRequestData(code),
      },
    );

    const data = await res.json();
    return data;
  }

  protected generateAuthRequestData(code: string) {
    const redirectUri =
      this.options.provider === OAuthProvider.Apple
        ? this.options.serverRedirectUri
        : this.options.redirectUri;
    const requestData = {
      code,
      client_id: this.options.oAuthClientId,
      redirect_uri: redirectUri,
      login_provider: this.options.provider,
      network: this.options.web3AuthNetwork,
    };

    return JSON.stringify(requestData);
  }

  abstract getUserInfo(idToken: string): Promise<OAuthUserInfo>;
}
