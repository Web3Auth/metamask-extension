import {
  AuthConnection,
  LoginHandlerOptions,
  AuthTokenResponse,
  OAuthUserInfo,
} from './types';

export abstract class BaseLoginHandler {
  public options: LoginHandlerOptions;

  constructor(options: LoginHandlerOptions) {
    this.options = options;
  }

  abstract get provider(): AuthConnection;

  abstract get scope(): string[];

  abstract getAuthUrl(): string;

  abstract getAuthIdToken(code: string): Promise<AuthTokenResponse>;

  abstract generateAuthTokenRequestData(code: string): string;

  abstract getUserInfo(idToken: string): Promise<OAuthUserInfo>;

  protected async requestAuthToken(
    requestData: string,
  ): Promise<AuthTokenResponse> {
    const res = await fetch(
      `${this.options.authServerUrl}/api/v1/oauth/token`,
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
}
