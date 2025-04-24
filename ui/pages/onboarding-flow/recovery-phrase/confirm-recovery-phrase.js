import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setSeedPhraseBackedUp } from '../../../store/actions';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import { ONBOARDING_METAMETRICS } from '../../../helpers/constants/routes';
import ConfirmSrpModal from './confirm-srp-modal';
import RecoveryPhraseChips from './recovery-phrase-chips';

const QUIZ_WORDS_COUNT = 3;

const generateQuizWords = (secretRecoveryPhrase) => {
  const randomIndices = new Set();
  const srpLength = secretRecoveryPhrase.length;

  while (randomIndices.size < QUIZ_WORDS_COUNT) {
    const randomIndex = Math.floor(Math.random() * srpLength);
    randomIndices.add(randomIndex);
  }

  const quizWords = Array.from(randomIndices).map((index) => {
    return {
      index,
      word: secretRecoveryPhrase[index],
    };
  });

  return quizWords;
};

export default function ConfirmRecoveryPhrase({ secretRecoveryPhrase = '' }) {
  const history = useHistory();
  const t = useI18nContext();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const splitSecretRecoveryPhrase = secretRecoveryPhrase.split(' ');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [matching, setMatching] = useState(false);
  const [quizWords, setQuizWords] = useState(
    generateQuizWords(splitSecretRecoveryPhrase),
  );
  const [answerSrp, setAnswerSrp] = useState('');

  const resetQuizWords = () => {
    const newQuizWords = generateQuizWords(splitSecretRecoveryPhrase);
    setQuizWords(newQuizWords);
  };

  const handleQuizInput = (inputValue) => {
    const isAnswered = inputValue.every((answer) => answer.word !== '');
    if (isAnswered) {
      const copySplitSrp = [...splitSecretRecoveryPhrase];
      inputValue.forEach((answer) => {
        copySplitSrp[answer.index] = answer.word;
      });
      setAnswerSrp(copySplitSrp.join(' '));
    } else {
      setAnswerSrp('');
    }
  };

  const tryContinue = () => {
    const isMatching = answerSrp === secretRecoveryPhrase;
    setMatching(isMatching);
    setShowConfirmModal(true);
  };

  const handleConfirmedPhrase = () => {
    dispatch(setSeedPhraseBackedUp(true));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
      properties: {
        hd_entropy_index: hdEntropyIndex,
      },
    });
    history.push(ONBOARDING_METAMETRICS);
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
          onClose={() => {
            resetQuizWords();
            setShowConfirmModal(false);
          }}
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
        quizWords={quizWords}
        confirmPhase
        setInputValue={handleQuizInput}
      />
      <div className="recovery-phrase__footer--button">
        <Button
          variant={ButtonVariant.Primary}
          width={BlockSize.Full}
          data-testid="recovery-phrase-confirm"
          size={ButtonSize.Large}
          className="recovery-phrase__footer__confirm--button"
          onClick={() => tryContinue()}
          disabled={!answerSrp}
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}

ConfirmRecoveryPhrase.propTypes = {
  secretRecoveryPhrase: PropTypes.string,
};
