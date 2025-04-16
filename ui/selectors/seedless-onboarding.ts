import { SeedlessOnboardingControllerState } from '@metamask/seedless-onboarding-controller';
import { createSelector } from '@reduxjs/toolkit';

type AppState = {
  metamask: SeedlessOnboardingControllerState;
};

const getState = (state: AppState) => state.metamask;

export const selectNodeAuthTokens = createSelector(
  getState,
  (state) => state.nodeAuthTokens,
);
