require('@babel/register');
require('ts-node').register({ transpileOnly: true });

require('./helpers/setup-helper');

global.platform = {
  // Required for: coin overviews components
  openTab: () => undefined,
  // Required for: settings info tab
  getVersion: () => '<version>',
};

// Required for: testing OAuth Controller login flow
global.chrome = {
  identity: {
    getRedirectURL: jest.fn().mockReturnValue('https://mocked-redirect-uri'),
    launchWebAuthFlow: jest.fn(),
  },
};
