import React, { useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  TextAlign,
  TextVariant,
  JustifyContent,
  AlignItems,
  FlexDirection,
  Display,
  BlockSize,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { ONBOARDING_REVIEW_SRP_ROUTE } from '../../../helpers/constants/routes';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  Box,
  Button,
  Text,
  ButtonSize,
  ButtonVariant,
  ButtonLink,
  ButtonLinkSize,
  ButtonIcon,
  IconName,
  ButtonIconSize,
} from '../../../components/component-library';
import SRPDetailsModal from '../../../components/app/srp-details-modal';
import SkipSRPBackup from './skip-srp-backup-popover';

export default function SecureYourWallet() {
  const history = useHistory();
  const t = useI18nContext();
  const { search } = useLocation();
  const [showSkipSRPBackupPopover, setShowSkipSRPBackupPopover] =
    useState(false);
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const searchParams = new URLSearchParams(search);
  const isFromReminderParam = searchParams.get('isFromReminder')
    ? '/?isFromReminder=true'
    : '';

  const trackEvent = useContext(MetaMetricsContext);

  const handleClickRecommended = () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecurityStarted,
    });
    history.push(`${ONBOARDING_REVIEW_SRP_ROUTE}${isFromReminderParam}`);
  };

  const handleClickNotRecommended = () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecuritySkipInitiated,
    });
    setShowSkipSRPBackupPopover(true);
  };

  return (
    <Box
      display={Display.Flex}
      justifyContent={JustifyContent.center}
      alignItems={AlignItems.flexStart}
      flexDirection={FlexDirection.Column}
      className="secure-your-wallet"
      data-testid="secure-your-wallet"
    >
      {showSkipSRPBackupPopover && (
        <SkipSRPBackup onClose={() => setShowSkipSRPBackupPopover(false)} />
      )}
      {showSrpDetailsModal && (
        <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
      )}
      {/* TODO: check fully it should just go back to the previous page */}
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <ButtonIcon
          iconName={IconName.ArrowLeft}
          color={IconColor.iconDefault}
          size={ButtonIconSize.Md}
          data-testid="secure-your-wallet-back-button"
          onClick={() => history.goBack()}
        />
      </Box>
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          {t('stepOf', [2, 3])}
        </Text>
        <Text variant={TextVariant.headingLg}>{t('seedPhraseIntroTitle')}</Text>
      </Box>
      <Box
        className="secure-your-wallet__srp-design-container"
        marginBottom={6}
        width={BlockSize.Full}
        textAlign={TextAlign.Center}
      >
        <img
          className="secure-your-wallet__srp-design-image"
          src="./images/srp-lock-design.png"
          alt="SRP Design"
        />
      </Box>
      <Box marginBottom={6}>
        <Text variant={TextVariant.bodyMd} marginBottom={6}>
          {t('secureWalletWalletSaveSrp', [
            [
              <ButtonLink
                key="secureWalletWalletSaveSrp"
                size={ButtonLinkSize.Inherit}
                onClick={() => {
                  setShowSrpDetailsModal(true);
                }}
              >
                {t('secretRecoveryPhrase')}
              </ButtonLink>,
            ],
          ])}
        </Text>
        <Text variant={TextVariant.bodyMd}>
          {t('secureWalletWalletRecover')}
        </Text>
      </Box>
      <Box
        className="secure-your-wallet__actions"
        width={BlockSize.Full}
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        gap={4}
      >
        <Button
          data-testid="secure-wallet-recommended"
          size={ButtonSize.Lg}
          block
          onClick={handleClickRecommended}
        >
          {t('secureWalletGetStartedButton')}
        </Button>
        <Button
          data-testid="secure-wallet-later"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Lg}
          block
          onClick={handleClickNotRecommended}
        >
          {t('secureWalletRemindLaterButton')}
        </Button>
      </Box>
    </Box>
  );
}
