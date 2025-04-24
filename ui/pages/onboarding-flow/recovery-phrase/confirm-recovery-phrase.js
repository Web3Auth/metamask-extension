import React, { useState, useMemo, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonSize,
  ButtonVariant,
  Text,
} from '../../../components/component-library';
import {
  TextVariant,
  JustifyContent,
  BlockSize,
  TextColor,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setSeedPhraseBackedUp } from '../../../store/actions';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import RecoveryPhraseChips from './recovery-phrase-chips';

export default function ConfirmRecoveryPhrase({ secretRecoveryPhrase = '' }) {
  const history = useHistory();
  const t = useI18nContext();
  const dispatch = useDispatch();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const splitSecretRecoveryPhrase = secretRecoveryPhrase.split(' ');
  const indicesToCheck = [2, 3, 7];
  const [matching, setMatching] = useState(false);
  const trackEvent = useContext(MetaMetricsContext);

  // Removes seed phrase words from chips corresponding to the
  // indicesToCheck so that user has to complete the phrase and confirm
  // they have saved it.
  const initializePhraseElements = () => {
    const phraseElements = { ...splitSecretRecoveryPhrase };
    indicesToCheck.forEach((i) => {
      phraseElements[i] = '';
    });
    return phraseElements;
  };
  const [phraseElements, setPhraseElements] = useState(
    initializePhraseElements(),
  );

  const validate = useMemo(
    () =>
      debounce((elements) => {
        setMatching(Object.values(elements).join(' ') === secretRecoveryPhrase);
      }, 500),
    [setMatching, secretRecoveryPhrase],
  );

  const handleSetPhraseElements = (values) => {
    setPhraseElements(values);
    validate(values);
  };

  return (
    <div
      className="recovery-phrase__confirm"
      data-testid="confirm-recovery-phrase"
    >
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          Step 3 of 3
        </Text>
        <Text variant={TextVariant.headingLg}>
          Confirm your Secret Recovery Phrase
        </Text>
      </Box>
      <Box marginBottom={6}>
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          Select the missing words in the correct order.
        </Text>
      </Box>
      <RecoveryPhraseChips
        secretRecoveryPhrase={splitSecretRecoveryPhrase}
        confirmPhase
        setInputValue={handleSetPhraseElements}
        inputValue={phraseElements}
        indicesToCheck={indicesToCheck}
      />
      <div className="recovery-phrase__footer__confirm">
        <Button
          variant={ButtonVariant.Primary}
          width={BlockSize.Full}
          data-testid="recovery-phrase-confirm"
          size={ButtonSize.Large}
          className="recovery-phrase__footer__confirm--button"
          onClick={async () => {
            await dispatch(setSeedPhraseBackedUp(true));
            trackEvent({
              category: MetaMetricsEventCategory.Onboarding,
              event:
                MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
              properties: {
                hd_entropy_index: hdEntropyIndex,
              },
            });
            history.push(ONBOARDING_COMPLETION_ROUTE);
          }}
          disabled={!matching}
        >
          {t('confirm')}
        </Button>
      </div>
    </div>
  );
}

ConfirmRecoveryPhrase.propTypes = {
  secretRecoveryPhrase: PropTypes.string,
};
