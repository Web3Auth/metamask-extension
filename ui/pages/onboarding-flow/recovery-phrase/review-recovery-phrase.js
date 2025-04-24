import React, { useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ONBOARDING_CONFIRM_SRP_ROUTE } from '../../../helpers/constants/routes';
import {
  Text,
  Icon,
  IconName,
  Box,
  Button,
  ButtonPrimary,
  ButtonVariant,
} from '../../../components/component-library';
import {
  TextVariant,
  JustifyContent,
  IconColor,
  BlockSize,
  TextColor,
} from '../../../helpers/constants/design-system';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import RecoveryPhraseChips from './recovery-phrase-chips';

export default function RecoveryPhrase({ secretRecoveryPhrase }) {
  const history = useHistory();
  const t = useI18nContext();
  const { search } = useLocation();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const [copied, handleCopy] = useCopyToClipboard();
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  const [hiddenPhrase, setHiddenPhrase] = useState(false);
  const searchParams = new URLSearchParams(search);
  const isFromReminderParam = searchParams.get('isFromReminder')
    ? '/?isFromReminder=true'
    : '';
  const trackEvent = useContext(MetaMetricsContext);

  return (
    <div className="recovery-phrase" data-testid="recovery-phrase">
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          Step 2 of 3
        </Text>
        <Text variant={TextVariant.headingLg}>
          Save your Secret Recovery Phrase
        </Text>
      </Box>
      <Box marginBottom={6}>
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          This is your Secret Recovery Phrase. Write it down in the correct
          order and keep it safe. If someone has your Secret Recovery Phrase,
          they can access your wallet. Don’t share it with anyone, ever.
        </Text>
      </Box>
      <RecoveryPhraseChips
        secretRecoveryPhrase={secretRecoveryPhrase.split(' ')}
        phraseRevealed={phraseRevealed && !hiddenPhrase}
        hiddenPhrase={hiddenPhrase}
      />
      <Box width={BlockSize.Full}>
        <Button
          width={BlockSize.Full}
          variant={ButtonVariant.Primary}
          data-testid="recovery-phrase-reveal"
          className="recovery-phrase__footer--button"
          onClick={() => console.log('Continue')}
        >
          Continue
        </Button>
      </Box>
    </div>
  );
}

RecoveryPhrase.propTypes = {
  secretRecoveryPhrase: PropTypes.string,
};
