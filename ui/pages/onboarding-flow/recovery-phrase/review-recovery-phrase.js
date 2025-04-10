import React, { useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
// import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
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
} from '../../../components/component-library';
import {
  TextVariant,
  JustifyContent,
  BlockSize,
  TextColor,
} from '../../../helpers/constants/design-system';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import SRPDetailsModal from '../../../components/app/srp-details-modal';
import RecoveryPhraseChips from './recovery-phrase-chips';

export default function RecoveryPhrase({ secretRecoveryPhrase }) {
  const history = useHistory();
  const t = useI18nContext();
  const { search } = useLocation();
  // TODO: Check on copy to clipboard
  // const [copied, handleCopy] = useCopyToClipboard();
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  // TODO: Check on hide phrase
  // const [hiddenPhrase, setHiddenPhrase] = useState(false);
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const searchParams = new URLSearchParams(search);
  const isFromReminderParam = searchParams.get('isFromReminder')
    ? '/?isFromReminder=true'
    : '';
  const trackEvent = useContext(MetaMetricsContext);

  return (
    <div className="recovery-phrase" data-testid="recovery-phrase">
      {showSrpDetailsModal && (
        <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
      )}
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
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          <Text variant={TextVariant.bodyMd} marginBottom={6}>
            {t('seedPhraseReviewDetails', [
              [
                <ButtonLink
                  key="seedPhraseReviewDetails"
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
        </Text>
      </Box>
      <RecoveryPhraseChips
        secretRecoveryPhrase={secretRecoveryPhrase.split(' ')}
        phraseRevealed={phraseRevealed}
        // hiddenPhrase={hiddenPhrase}
        revealPhrase={() => {
          trackEvent({
            category: MetaMetricsEventCategory.Onboarding,
            event: MetaMetricsEventName.OnboardingWalletSecurityPhraseRevealed,
          });
          setPhraseRevealed(true);
        }}
      />
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
