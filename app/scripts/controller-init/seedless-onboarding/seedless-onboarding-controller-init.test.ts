import {
  SeedlessOnboardingController,
  Web3AuthNetwork,
} from '@metamask/seedless-onboarding-controller';
import { Messenger } from '@metamask/base-controller';
import { ControllerInitRequest } from '../types';
import {
  getSeedlessOnboardingControllerInitMessenger,
  SeedlessOnboardingControllerInitMessenger,
} from '../messengers/seedless-onboarding';
import { buildControllerInitRequestMock } from '../test/utils';
import { SeedlessOnboardingControllerInit } from './seedless-onboarding-controller-init';

jest.mock('@metamask/seedless-onboarding-controller');

function buildInitRequestMock(): jest.Mocked<
  ControllerInitRequest<SeedlessOnboardingControllerInitMessenger>
> {
  const baseControllerMessenger = new Messenger();

  return {
    ...buildControllerInitRequestMock(),
    controllerMessenger: getSeedlessOnboardingControllerInitMessenger(
      baseControllerMessenger,
    ),
    initMessenger: undefined,
  };
}

describe('SeedlessOnboardingControllerInit', () => {
  const SeedlessOnboardingControllerClassMock = jest.mocked(
    SeedlessOnboardingController,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return controller instance', () => {
    const requestMock = buildInitRequestMock();
    expect(
      SeedlessOnboardingControllerInit(requestMock).controller,
    ).toBeInstanceOf(SeedlessOnboardingController);
  });

  it('initializes with correct messenger and state', () => {
    const requestMock = buildInitRequestMock();
    SeedlessOnboardingControllerInit(requestMock);

    expect(SeedlessOnboardingControllerClassMock).toHaveBeenCalledWith({
      messenger: requestMock.controllerMessenger,
      state: requestMock.persistedState.SeedlessOnboardingController,
      network: Web3AuthNetwork.Devnet,
    });
  });
});
