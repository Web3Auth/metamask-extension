import {
  SeedlessOnboardingController,
  SeedlessOnboardingControllerMessenger,
  Web3AuthNetwork,
} from '@metamask/seedless-onboarding-controller';
import { EncryptionKey, EncryptionResult } from '@metamask/browser-passworder';
import { ControllerInitFunction } from '../types';
import { encryptorFactory } from '../../lib/encryptor-factory';

export const SeedlessOnboardingControllerInit: ControllerInitFunction<
  SeedlessOnboardingController<EncryptionKey>,
  // @ts-expect-error TODO: Resolve mismatch between base-controller versions.
  SeedlessOnboardingControllerMessenger
> = (request) => {
  const { controllerMessenger, persistedState } = request;

  const encryptor = encryptorFactory(600_000);

  const controller = new SeedlessOnboardingController({
    messenger: controllerMessenger,
    state: persistedState.SeedlessOnboardingController,
    network: Web3AuthNetwork.Devnet,
    encryptor: {
      ...encryptor,
      decryptWithKey(key, encryptedData) {
        let payload: EncryptionResult;
        if (typeof encryptedData === 'string') {
          payload = JSON.parse(encryptedData);
        } else {
          payload = encryptedData;
        }

        return encryptor.decryptWithKey(key, payload);
      },
    },
  });

  return {
    controller,
  };
};
