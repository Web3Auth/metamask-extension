import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import initializedMockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import {
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
} from '../../../helpers/constants/routes';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import { setFirstTimeFlowType } from '../../../store/actions';
import GetStarted from './get-started';

const mockHistoryReplace = jest.fn();
const mockHistoryPush = jest.fn();

jest.mock('../../../store/actions.ts', () => ({
  setFirstTimeFlowType: jest.fn().mockReturnValue(
    jest.fn((type) => {
      return type;
    }),
  ),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
    replace: mockHistoryReplace,
  }),
}));

describe('Onboarding Welcome Component', () => {
  const mockState = {
    metamask: {
      internalAccounts: {
        accounts: {},
        selectedAccount: '',
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialized State Conditionals with keyrings and firstTimeFlowType', () => {
    it('should route to secure your wallet when keyring is present but not imported first time flow type', () => {
      const mockStore = configureMockStore([thunk])(initializedMockState);

      renderWithProvider(<GetStarted />, mockStore);
      expect(mockHistoryReplace).toHaveBeenCalledWith(
        ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
      );
    });

    it('should route to completion when keyring is present and imported first time flow type', () => {
      const importFirstTimeFlowState = {
        ...initializedMockState,
        metamask: {
          ...initializedMockState.metamask,
          firstTimeFlowType: FirstTimeFlowType.import,
        },
      };
      const mockStore = configureMockStore([thunk])(importFirstTimeFlowState);

      renderWithProvider(<GetStarted />, mockStore);
      expect(mockHistoryReplace).toHaveBeenCalledWith(
        ONBOARDING_COMPLETION_ROUTE,
      );
    });
  });

  describe('Welcome Component', () => {
    const mockStore = configureMockStore([thunk])(mockState);

    it('should render', () => {
      renderWithProvider(<GetStarted />, mockStore);
      const onboardingWelcome = screen.queryByTestId('onboarding-welcome');
      expect(onboardingWelcome).toBeInTheDocument();
    });

    it('should set first time flow to create and route to metametrics', () => {
      renderWithProvider(<GetStarted />, mockStore);
      const termsCheckbox = screen.getByTestId('onboarding-terms-checkbox');
      fireEvent.click(termsCheckbox);
    });

    it('should create new wallet modal', async () => {
      const { getByText } = renderWithProvider(<GetStarted />, mockStore);
      const createWallet = screen.getByTestId('onboarding-create-wallet');
      fireEvent.click(createWallet);

      const createSrpButton = getByText('Continue with Secret Recovery Phrase');
      expect(createSrpButton).toBeInTheDocument();

      fireEvent.click(createSrpButton);

      await waitFor(() => {
        expect(setFirstTimeFlowType).toHaveBeenCalledWith(
          FirstTimeFlowType.create,
        );
        expect(mockHistoryPush).toHaveBeenCalledWith(
          ONBOARDING_CREATE_PASSWORD_ROUTE,
        );
      });
    });

    it('should open login to existing wallet modal', async () => {
      const { getByText } = renderWithProvider(<GetStarted />, mockStore);
      const createWallet = screen.getByTestId('onboarding-import-wallet');
      fireEvent.click(createWallet);

      const importSrpButton = getByText('Import using Secret Recovery Phrase');
      expect(importSrpButton).toBeInTheDocument();

      fireEvent.click(importSrpButton);

      await waitFor(() => {
        expect(setFirstTimeFlowType).toHaveBeenCalledWith(
          FirstTimeFlowType.import,
        );
        expect(mockHistoryPush).toHaveBeenCalledWith(
          ONBOARDING_IMPORT_WITH_SRP_ROUTE,
        );
      });
    });
  });
});
