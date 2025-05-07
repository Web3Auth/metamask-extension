export const LOGIN_TYPE = {
  GOOGLE: 'google',
  APPLE: 'apple',
  SRP: 'srp',
} as const;

export type LoginType = (typeof LOGIN_TYPE)[keyof typeof LOGIN_TYPE];
