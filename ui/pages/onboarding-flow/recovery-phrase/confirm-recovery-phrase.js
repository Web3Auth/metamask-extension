import React, { useState, useMemo, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonIconSize,
  ButtonSize,
  ButtonVariant,
  IconName,
  Text,
} from '../../../components/component-library';
import {
  TextVariant,
  JustifyContent,
  BlockSize,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_METAMETRICS } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setSeedPhraseBackedUp } from '../../../store/actions';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import RecoveryPhraseChips from './recovery-phrase-chips';
import ConfirmSrpModal from './confirm-srp-modal';

export default function ConfirmRecoveryPhrase({ secretRecoveryPhrase = '' }) {
  const history = useHistory();
  const t = useI18nContext();
  const dispatch = useDispatch();
  const splitSecretRecoveryPhrase = secretRecoveryPhrase.split(' ');
  const indicesToCheck = [2, 3, 7];
  const [matching, setMatching] = useState(false);
  const trackEvent = useContext(MetaMetricsContext);
  const [completedQuizWords, setCompletedQuizWords] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const validateQuizWords = useMemo(
    () =>
      debounce((elements) => {
        const quizWords = Object.values(elements).filter(
          (value) => value !== '',
        );
        const srpLength = secretRecoveryPhrase.split(' ').length;
        setCompletedQuizWords(quizWords.length === srpLength);
      }, 500),
    [setCompletedQuizWords, secretRecoveryPhrase],
  );

  const tryContinue = async () => {
    const isMatching =
      Object.values(phraseElements).join(' ') === secretRecoveryPhrase;
    setMatching(isMatching);
    setShowConfirmModal(true);
  };

  const handleConfirmedPhrase = () => {
    dispatch(setSeedPhraseBackedUp(true));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
    });
    history.push(ONBOARDING_METAMETRICS);
  };

  const handleSetPhraseElements = (values) => {
    setPhraseElements(values);
    validateQuizWords(values);
  };

  return (
    <div
      className="recovery-phrase__confirm"
      data-testid="confirm-recovery-phrase"
    >
      {showConfirmModal && (
        <ConfirmSrpModal
          isError={!matching}
          onContinue={handleConfirmedPhrase}
          onClose={() => setShowConfirmModal(false)}
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
          data-testid="confirm-recovery-phrase-back-button"
          onClick={() => history.goBack()}
        />
      </Box>
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          {t('stepOf', [3, 3])}
        </Text>
        <Text variant={TextVariant.headingLg}>
          {t('confirmRecoveryPhraseTitle')}
        </Text>
      </Box>
      <Box marginBottom={6}>
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          {t('confirmRecoveryPhraseDetails')}
        </Text>
      </Box>
      <RecoveryPhraseChips
        secretRecoveryPhrase={splitSecretRecoveryPhrase}
        confirmPhase
        setInputValue={handleSetPhraseElements}
        inputValue={phraseElements}
        indicesToCheck={indicesToCheck}
      />
      <div className="recovery-phrase__footer--button">
        <Button
          variant={ButtonVariant.Primary}
          width={BlockSize.Full}
          data-testid="recovery-phrase-confirm"
          size={ButtonSize.Large}
          className="recovery-phrase__footer__confirm--button"
          onClick={tryContinue}
          disabled={!completedQuizWords}
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
