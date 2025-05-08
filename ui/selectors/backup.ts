import {
  KeyringControllerState,
  KeyringMetadata,
} from '@metamask/keyring-controller';
import {
  AuthConnection,
  SeedlessOnboardingControllerState,
} from '@metamask/seedless-onboarding-controller';

export type BackupState = {
  metamask: KeyringControllerState & SeedlessOnboardingControllerState;
};

export function getSocialLoginType(
  state: BackupState,
): AuthConnection | undefined {
  return state.metamask.authConnection;
}

export function getSocialLoginEmail(state: BackupState): string | undefined {
  return state.metamask.socialLoginEmail;
}

export function getKeyringsMetadata(state: BackupState): KeyringMetadata[] {
  return state.metamask.keyringsMetadata;
}

export function getSocialBackups(state: BackupState) {
  return state.metamask.socialBackupsMetadata;
}

export function getBackupState(state: BackupState) {
  const keyringsMetadata = getKeyringsMetadata(state);
  const socialBackups = getSocialBackups(state);

  return keyringsMetadata.map((keyring) => {
    const hasBackup = socialBackups.find((backup) => backup.id === keyring.id);
    return {
      id: keyring.id,
      name: keyring.name,
      hasBackup: Boolean(hasBackup),
    };
  });
}
