import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/component-library/button';
import {
  TextVariant,
  Display,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BorderRadius,
  BlockSize,
  FontWeight,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import {
  Box,
  Text,
  IconName,
  IconSize,
  ButtonBase,
  Icon,
  ButtonLink,
  ButtonLinkSize,
  ButtonIcon,
  ButtonIconSize,
} from '../../../components/component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  ONBOARDING_PRIVACY_SETTINGS_ROUTE,
  ONBOARDING_PASSWORD_HINT,
  ONBOARDING_PIN_EXTENSION_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getCurrentKeyring,
  getFirstTimeFlowType,
  getPasswordHint,
} from '../../../selectors';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { selectIsProfileSyncingEnabled } from '../../../selectors/identity/profile-syncing';
import { getSeedPhraseBackedUp } from '../../../ducks/metamask/metamask';

export default function AccountExist() {
  const history = useHistory();
  const t = useI18nContext();
  const trackEvent = useContext(MetaMetricsContext);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const currentKeyring = useSelector(getCurrentKeyring);
  const seedPhraseBackedUp = useSelector(getSeedPhraseBackedUp);
  const learnMoreLink =
    'https://support.metamask.io/hc/en-us/articles/360015489591-Basic-Safety-and-Security-Tips-for-MetaMask';
  // const learnHowToKeepWordsSafe =
  //   'https://community.metamask.io/t/what-is-a-secret-recovery-phrase-and-how-to-keep-your-crypto-wallet-secure/3440';

  const isProfileSyncingEnabled = useSelector(selectIsProfileSyncingEnabled);

  const passwordHint = useSelector(getPasswordHint);

  const onDone = async () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletCreationComplete,
      properties: {
        method: firstTimeFlowType,
        is_profile_syncing_enabled: isProfileSyncingEnabled,
      },
    });

    history.push(ONBOARDING_PIN_EXTENSION_ROUTE);
  };
  return (
    <Box
      className="account-exist"
      data-testid="account-exist"
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
    >
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <ButtonIcon
          iconName={IconName.ArrowLeft}
          color={IconColor.iconDefault}
          size={ButtonIconSize.Md}
          data-testid="create-password-back-button"
          onClick={() => history.goBack()}
        />
      </Box>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.flexStart}
      >
        <Text
          variant={TextVariant.headingLg}
          as="h2"
          justifyContent={JustifyContent.center}
          style={{
            alignSelf: AlignItems.flexStart,
          }}
          marginBottom={4}
        >
          {t('accountAlreadyExistsTitle')}
        </Text>
        <Box
          width={BlockSize.Full}
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
          marginBottom={6}
        >
          <img
            src="images/wallet-ready.svg"
            width={276}
            height={276}
            alt="Account already exists"
          />
        </Box>
        <Text variant={TextVariant.bodyMd} marginBottom={6}>
          {t('accountAlreadyExistsLoginDescription', ['username@gmail.com'])}
        </Text>
      </Box>

      <Box
        className="account-exist__actions"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
      >
        <Button
          data-testid="onboarding-complete-done"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          width={BlockSize.Full}
          onClick={onDone}
        >
          {t('accountAlreadyExistsLogin')}
        </Button>
      </Box>
    </Box>
  );
}
