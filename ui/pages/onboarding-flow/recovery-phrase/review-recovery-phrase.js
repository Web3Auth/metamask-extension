import React, { useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ONBOARDING_CONFIRM_SRP_ROUTE } from '../../../helpers/constants/routes';
import {
  Text,
  Box,
  Button,
  ButtonVariant,
  ButtonLink,
  ButtonLinkSize,
  ButtonSize,
  ButtonIcon,
  IconName,
  ButtonIconSize,
} from '../../../components/component-library';
import {
  TextVariant,
  JustifyContent,
  BlockSize,
  TextColor,
  IconColor,
  FontWeight,
} from '../../../helpers/constants/design-system';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import SRPDetailsModal from '../../../components/app/srp-details-modal';
import RecoveryPhraseChips from './recovery-phrase-chips';

export default function RecoveryPhrase({ secretRecoveryPhrase }) {
  const history = useHistory();
  const t = useI18nContext();
  const { search } = useLocation();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  // TODO: Check on copy to clipboard
  // const [copied, handleCopy] = useCopyToClipboard();
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const searchParams = new URLSearchParams(search);
  const isFromReminderParam = searchParams.get('isFromReminder')
    ? '/?isFromReminder=true'
    : '';
  const trackEvent = useContext(MetaMetricsContext);

  return (
    <div className="recovery-phrase" data-testid="recovery-phrase">
      <div className="recovery-phrase__content">
        {showSrpDetailsModal && (
          <SRPDetailsModal
            onClose={() => setShowSrpDetailsModal(false)}
            marginBottom={4}
          />
        )}
        <Box
          justifyContent={JustifyContent.flexStart}
          marginBottom={4}
          width={BlockSize.Full}
        >
          <ButtonIcon
            iconName={IconName.ArrowLeft}
            color={IconColor.iconDefault}
            size={ButtonIconSize.Md}
            data-testid="review-srp-back-button"
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
          <Text variant={TextVariant.headingLg}>
            {t('seedPhraseReviewTitle')}
          </Text>
        </Box>
        <Box marginBottom={6}>
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
            marginBottom={6}
          >
            {t('seedPhraseReviewDetails', [
              <ButtonLink
                key="seedPhraseReviewDetails"
                size={ButtonLinkSize.Inherit}
                onClick={() => {
                  setShowSrpDetailsModal(true);
                }}
              >
                {t('secretRecoveryPhrase')}
              </ButtonLink>,
              <Text
                key="seedPhraseReviewDetails2"
                fontWeight={FontWeight.Medium}
              >
                {t('seedPhraseReviewDetails2')}
              </Text>,
            ])}
          </Text>
        </Box>
        <RecoveryPhraseChips
          secretRecoveryPhrase={secretRecoveryPhrase.split(' ')}
          phraseRevealed={phraseRevealed}
          revealPhrase={() => {
            trackEvent({
              category: MetaMetricsEventCategory.Onboarding,
              event:
                MetaMetricsEventName.OnboardingWalletSecurityPhraseRevealed,
              properties: {
                hd_entropy_index: hdEntropyIndex,
              },
            });
            setPhraseRevealed(true);
          }}
        />
      </div>
      <Box width={BlockSize.Full}>
        <Button
          width={BlockSize.Full}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          data-testid="recovery-phrase-reveal"
          className="recovery-phrase__footer--button"
          disabled={!phraseRevealed}
          onClick={() => {
            trackEvent({
              category: MetaMetricsEventCategory.Onboarding,
              event:
                MetaMetricsEventName.OnboardingWalletSecurityPhraseWrittenDown,
              properties: {
                hd_entropy_index: hdEntropyIndex,
              },
            });
            history.push(
              `${ONBOARDING_CONFIRM_SRP_ROUTE}${isFromReminderParam}`,
            );
          }}
        >
          {t('continue')}
        </Button>
      </Box>
    </div>
  );
}

RecoveryPhrase.propTypes = {
  secretRecoveryPhrase: PropTypes.string,
};
