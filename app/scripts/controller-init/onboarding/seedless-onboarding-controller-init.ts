import {
  SeedlessOnboardingController,
  SeedlessOnboardingControllerMessenger,
} from '@metamask/seedless-onboarding-controller';
import { ControllerInitFunction } from '../types';

export const SeedlessOnboardingControllerInit: ControllerInitFunction<
  SeedlessOnboardingController,
  SeedlessOnboardingControllerMessenger
> = (request) => {
  const { controllerMessenger } = request;
  const controller = new SeedlessOnboardingController({
    messenger: controllerMessenger,
  });

  return {
    controller,
  };
};
