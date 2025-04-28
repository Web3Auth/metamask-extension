import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import configureMockStore from 'redux-mock-store';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-flask)
  ONBOARDING_EXPERIMENTAL_AREA,
  ///: END:ONLY_INCLUDE_IF
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_REVIEW_SRP_ROUTE,
  ONBOARDING_CONFIRM_SRP_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
  DEFAULT_ROUTE,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_PRIVACY_SETTINGS_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
  ONBOARDING_PIN_EXTENSION_ROUTE,
  ONBOARDING_METAMETRICS,
} from '../../helpers/constants/routes';
import { CHAIN_IDS } from '../../../shared/constants/network';
import {
  createNewVaultAndGetSeedPhrase,
  unlockAndGetSeedPhrase,
} from '../../store/actions';
import { mockNetworkState } from '../../../test/stub/networks';
import OnboardingFlow from './onboarding-flow';

jest.mock('../../store/actions', () => ({
  createNewVaultAndGetSeedPhrase: jest.fn().mockResolvedValue(null),
  unlockAndGetSeedPhrase: jest.fn().mockResolvedValue(null),
  createNewVaultAndRestore: jest.fn(),
  setOnboardingDate: jest.fn(() => ({ type: 'TEST_DISPATCH' })),
  setIsBackupAndSyncFeatureEnabled: jest.fn(),
}));

describe('Onboarding Flow', () => {
  const mockState = {
    metamask: {
      internalAccounts: {
        accounts: {
          accountId: {
            address: '0x0000000000000000000000000000000000000000',
            metadata: {
              keyring: 'HD Key Tree',
            },
          },
        },
        selectedAccount: '',
      },
      keyrings: [
        {
          type: 'HD Key Tree',
          accounts: ['0x0000000000000000000000000000000000000000'],
        },
      ],
      ...mockNetworkState(
        { chainId: CHAIN_IDS.GOERLI },
        { chainId: CHAIN_IDS.MAINNET },
        { chainId: CHAIN_IDS.LINEA_MAINNET },
      ),
      preferences: {
        petnamesEnabled: true,
      },
    },
    localeMessages: {
      currentLocale: 'en',
    },
    appState: {
      externalServicesOnboardingToggleState: true,
    },
  };

  process.env.METAMASK_BUILD_TYPE = 'main';

  const store = configureMockStore()(mockState);

  it('should route to the default route when completedOnboarding and seedPhraseBackedUp is true', () => {
    const completedOnboardingState = {
      metamask: {
        completedOnboarding: true,
        seedPhraseBackedUp: true,
        internalAccounts: {
          accounts: {
            accountId: {
              address: '0x0000000000000000000000000000000000000000',
              metadata: {
                keyring: 'HD Key Tree',
              },
            },
          },
          selectedAccount: 'accountId',
        },
        keyrings: [
          {
            type: 'HD Key Tree',
            accounts: ['0x0000000000000000000000000000000000000000'],
          },
        ],
      },
    };

    const completedOnboardingStore = configureMockStore()(
      completedOnboardingState,
    );

    const { history } = renderWithProvider(
      <OnboardingFlow />,
      completedOnboardingStore,
      '/other',
    );

    expect(history.location.pathname).toStrictEqual(DEFAULT_ROUTE);
  });

  it('should render secure your wallet component', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
    );

    const secureYourWallet = queryByTestId('secure-your-wallet');
    expect(secureYourWallet).toBeInTheDocument();
  });

  it('should render review recovery phrase', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_REVIEW_SRP_ROUTE,
    );

    const recoveryPhrase = queryByTestId('recovery-phrase');
    expect(recoveryPhrase).toBeInTheDocument();
  });

  // TODO: fix this test
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should render confirm recovery phrase', () => {
    const { getByText } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_CONFIRM_SRP_ROUTE,
    );

    expect(
      getByText('Confirm your Secret Recovery Phrase'),
    ).toBeInTheDocument();
  });

  it('should render import seed phrase', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_IMPORT_WITH_SRP_ROUTE,
    );

    const importSrp = queryByTestId('import-srp');
    expect(importSrp).toBeInTheDocument();
  });

  it('should render privacy settings', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_PRIVACY_SETTINGS_ROUTE,
    );

    const privacySettings = queryByTestId('privacy-settings');
    expect(privacySettings).toBeInTheDocument();
  });

  it('should render onboarding creation/completion successful', () => {
    const { queryByText } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_COMPLETION_ROUTE,
    );

    const creationSuccessful = queryByText('We’ll remind you later');
    expect(creationSuccessful).toBeInTheDocument();
  });

  it('should render onboarding welcome screen', () => {
    const { getByText } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_WELCOME_ROUTE,
    );

    expect(getByText('Welcome to MetaMask')).toBeInTheDocument();
  });

  it('should render onboarding pin extension screen', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_PIN_EXTENSION_ROUTE,
    );

    const pinExtension = queryByTestId('onboarding-pin-extension');
    expect(pinExtension).toBeInTheDocument();
  });

  it('should render onboarding metametrics screen', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_METAMETRICS,
    );

    const onboardingMetametrics = queryByTestId('onboarding-metametrics');
    expect(onboardingMetametrics).toBeInTheDocument();
  });

  it('should render onboarding experimental screen', () => {
    const { queryByTestId } = renderWithProvider(
      <OnboardingFlow />,
      store,
      ONBOARDING_EXPERIMENTAL_AREA,
    );

    const onboardingMetametrics = queryByTestId('experimental-area');
    expect(onboardingMetametrics).toBeInTheDocument();
  });

  describe('Create Password', () => {
    it('should render create password', () => {
      const { queryByTestId } = renderWithProvider(
        <OnboardingFlow />,
        store,
        ONBOARDING_CREATE_PASSWORD_ROUTE,
      );

      const createPassword = queryByTestId('create-password');
      expect(createPassword).toBeInTheDocument();
    });

    it('should call createNewVaultAndGetSeedPhrase when creating a new wallet password', async () => {
      const { queryByTestId } = renderWithProvider(
        <OnboardingFlow />,
        store,
        ONBOARDING_CREATE_PASSWORD_ROUTE,
      );

      const password = 'a-new-password';
      const checkTerms = queryByTestId('create-password-terms');
      const createPasswordTextField = queryByTestId('create-password-new');
      const createPasswordInput = createPasswordTextField
        .getElementsByTagName('input')
        .item(0);
      const confirmPassword = queryByTestId('create-password-confirm');
      const confirmPasswordInput = confirmPassword
        .getElementsByTagName('input')
        .item(0);
      const createPasswordWallet = queryByTestId('create-password-submit');

      fireEvent.click(checkTerms);
      fireEvent.change(createPasswordInput, { target: { value: password } });
      fireEvent.change(confirmPasswordInput, { target: { value: password } });
      fireEvent.click(createPasswordWallet);

      await waitFor(() =>
        expect(createNewVaultAndGetSeedPhrase).toHaveBeenCalled(),
      );
    });
  });

  describe('Unlock Screen', () => {
    it('should render unlock page', () => {
      const { queryByTestId } = renderWithProvider(
        <OnboardingFlow />,
        store,
        ONBOARDING_UNLOCK_ROUTE,
      );

      const unlockPage = queryByTestId('unlock-page');
      expect(unlockPage).toBeInTheDocument();
    });

    it('should', async () => {
      const { getByLabelText, getByText } = renderWithProvider(
        <OnboardingFlow />,
        store,
        ONBOARDING_UNLOCK_ROUTE,
      );

      const password = 'a-new-password';
      const inputPassword = getByLabelText('Password');
      const unlockButton = getByText('Unlock');

      fireEvent.change(inputPassword, { target: { value: password } });
      fireEvent.click(unlockButton);
      await waitFor(() => expect(unlockAndGetSeedPhrase).toHaveBeenCalled());
    });
  });
});
