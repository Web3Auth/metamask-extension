import { Messenger, RestrictedMessenger } from '@metamask/base-controller';

import { getSeedlessOnboardingControllerInitMessenger } from './seedless-onboarding-controller-messenger';

describe('getSeedlessOnboardingControllerMessenger', () => {
  it('returns a restricted messenger', () => {
    const messenger = new Messenger<never, never>();
    const seedlessOnboardingControllerMessenger =
      getSeedlessOnboardingControllerInitMessenger(messenger);

    expect(seedlessOnboardingControllerMessenger).toBeInstanceOf(
      RestrictedMessenger,
    );
  });
});
