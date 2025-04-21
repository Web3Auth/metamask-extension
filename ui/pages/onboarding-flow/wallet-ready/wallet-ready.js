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
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';

export default function WalletReady() {
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
      className="wallet-ready"
      data-testid="wallet-ready"
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
    >
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
          {firstTimeFlowType === FirstTimeFlowType.seedless
            ? t('yourWalletIsReady')
            : t('yourWalletIsReadyRemind')}
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
            width={165}
            height={165}
            alt="Wallet Ready"
          />
        </Box>
        <Text variant={TextVariant.bodyMd} marginBottom={6}>
          {seedPhraseBackedUp
            ? t('walletReadyLoseSrp')
            : t('walletReadyLoseSrpRemind')}
        </Text>
        <Text variant={TextVariant.bodyMd} marginBottom={6}>
          {seedPhraseBackedUp
            ? t('walletReadyLearn', [
                <ButtonLink
                  key="walletReadyLearn"
                  size={ButtonLinkSize.Inherit}
                  textProps={{
                    variant: TextVariant.bodyMd,
                    alignItems: AlignItems.flexStart,
                  }}
                  as="a"
                  href={learnMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('learnHow')}
                </ButtonLink>,
              ])
            : t('walletReadyLearnRemind')}
        </Text>
      </Box>

      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        alignItems={AlignItems.flexStart}
        className="wallet-ready__settings-actions"
        gap={4}
      >
        {currentKeyring && (
          <ButtonBase
            variant={ButtonVariant.Secondary}
            borderRadius={BorderRadius.LG}
            width={BlockSize.Full}
            onClick={() => history.push(ONBOARDING_PASSWORD_HINT)}
          >
            <Box display={Display.Flex} alignItems={AlignItems.center}>
              <Icon
                name={IconName.AddSquare}
                size={IconSize.Md}
                marginInlineEnd={3}
              />
              <Box>
                <Text variant={TextVariant.bodyMdMedium}>
                  {t('passwordHintCreate')}
                </Text>
                {passwordHint && (
                  <Text
                    variant={TextVariant.bodySm}
                    color={TextColor.textAlternative}
                  >
                    {passwordHint}
                  </Text>
                )}
              </Box>
            </Box>
            <Icon name={IconName.ArrowRight} size={IconSize.Sm} />
          </ButtonBase>
        )}
        <ButtonBase
          variant={ButtonVariant.Secondary}
          borderRadius={BorderRadius.LG}
          width={BlockSize.Full}
          onClick={() => history.push(ONBOARDING_PRIVACY_SETTINGS_ROUTE)}
        >
          <Box display={Display.Flex} alignItems={AlignItems.center}>
            <Icon
              name={IconName.Setting}
              size={IconSize.Md}
              marginInlineEnd={3}
            />
            <Text variant={TextVariant.bodyMd} fontWeight={FontWeight.Medium}>
              {t('manageDefaultSettings')}
            </Text>
          </Box>
          <Icon name={IconName.ArrowRight} size={IconSize.Sm} />
        </ButtonBase>
      </Box>

      <Box
        className="wallet-ready__actions"
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
          {t('done')}
        </Button>
      </Box>
    </Box>
  );
}
