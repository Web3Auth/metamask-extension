import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonBase,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
  TextField,
} from '../../../components/component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  TextVariant,
  Display,
  TextColor,
  FontWeight,
  FlexDirection,
  BlockSize,
  BorderRadius,
  IconColor,
} from '../../../helpers/constants/design-system';
import { QuizWords } from './types';

export default function RecoveryPhraseChips({
  secretRecoveryPhrase,
  phraseRevealed,
  revealPhrase,
  confirmPhase,
  quizWords = [],
  setInputValue,
}: {
  secretRecoveryPhrase: string[];
  phraseRevealed?: boolean;
  revealPhrase?: () => void;
  confirmPhase?: boolean;
  quizWords?: QuizWords;
  setInputValue?: (quizAnswers: QuizWords) => void;
}) {
  const t = useI18nContext();
  const hideSeedPhrase = phraseRevealed === false;
  const phrasesToDisplay = secretRecoveryPhrase;
  const indicesToCheck = quizWords.map((word) => word.index);
  const [quizAnswers, setQuizAnswers] = useState(
    indicesToCheck.map((index) => ({
      index,
      word: '',
    })),
  );

  const setNextTargetIndex = (newQuizAnswers: QuizWords) => {
    const emptyAnswers = newQuizAnswers
      .filter((answer) => answer.word === '')
      .map((answer) => answer.index);
    const firstEmpty = emptyAnswers.length ? Math.min(...emptyAnswers) : -1;

    return firstEmpty;
  };
  const [indexToFocus, setIndexToFocus] = useState(
    setNextTargetIndex(quizAnswers),
  );

  const addQuizWord = (word: string) => {
    const newQuizAnswers = [...quizAnswers];
    const targetIndex = newQuizAnswers.findIndex(
      (answer) => answer.index === indexToFocus,
    );
    newQuizAnswers[targetIndex] = { index: indexToFocus, word };
    setQuizAnswers(newQuizAnswers);
    setIndexToFocus(setNextTargetIndex(newQuizAnswers));
  };

  const removeQuizWord = (answerWord: string) => {
    const newQuizAnswers = [...quizAnswers];
    const targetIndex = newQuizAnswers.findIndex(
      (answer) => answer.word === answerWord,
    );
    newQuizAnswers[targetIndex] = {
      ...newQuizAnswers[targetIndex],
      word: '',
    };

    setQuizAnswers(newQuizAnswers);
    setIndexToFocus(setNextTargetIndex(newQuizAnswers));
  };

  useEffect(() => {
    setInputValue && setInputValue(quizAnswers);
  }, [quizAnswers, setInputValue]);

  useEffect(() => {
    if (quizWords.length) {
      const newIndicesToCheck = quizWords.map((word) => word.index);
      const newQuizAnswers = newIndicesToCheck.map((index) => ({
        index,
        word: '',
      }));
      setQuizAnswers(newQuizAnswers);
      setIndexToFocus(setNextTargetIndex(newQuizAnswers));
    }
  }, [quizWords]);

  return (
    <Box display={Display.Flex} flexDirection={FlexDirection.Column} gap={4}>
      <Box
        padding={4}
        borderRadius={BorderRadius.LG}
        display={Display.Grid}
        className="recovery-phrase__secret"
      >
        <div
          data-testid="recovery-phrase-chips"
          className={classnames('recovery-phrase__chips', {
            'recovery-phrase__chips--hidden': hideSeedPhrase,
          })}
        >
          {phrasesToDisplay.map((word, index) => {
            const isQuizWord = indicesToCheck.includes(index);
            const wordToDisplay = isQuizWord
              ? quizAnswers.find((answer) => answer.index === index)?.word || ''
              : word;
            return (
              <TextField
                key={index}
                value={wordToDisplay}
                className={classnames({
                  'mm-text-field--target-index': index === indexToFocus,
                  'mm-text-field--quiz-word': isQuizWord,
                })}
                startAccessory={
                  <Text
                    color={TextColor.textAlternative}
                    className="recovery-phrase__word-index"
                  >
                    {index + 1}.
                  </Text>
                }
                readOnly
                disabled={confirmPhase && !isQuizWord}
                onClick={() => {
                  if (!confirmPhase) {
                    return;
                  }
                  if (wordToDisplay === '') {
                    setIndexToFocus(index);
                  } else {
                    removeQuizWord(wordToDisplay);
                  }
                }}
              />
            );
          })}
        </div>

        {hideSeedPhrase && (
          <div className="recovery-phrase__secret-blocker-container">
            <div className="recovery-phrase__secret-blocker" />
            <Box
              className="recovery-phrase__secret-blocker-text"
              onClick={() => {
                revealPhrase && revealPhrase();
              }}
            >
              <Icon
                name={IconName.EyeSlash}
                color={IconColor.iconDefault}
                size={IconSize.Md}
              />
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.textDefault}
                fontWeight={FontWeight.Medium}
              >
                {t('tapToReveal')}
              </Text>
              <Text variant={TextVariant.bodySm} color={TextColor.textDefault}>
                {t('tapToRevealNote')}
              </Text>
            </Box>
          </div>
        )}
      </Box>
      {quizWords.length > 0 && (
        <Box display={Display.Flex} gap={2} width={BlockSize.Full}>
          {quizWords.map((value) => {
            const answeredWords = quizAnswers.map((answer) => answer.word);
            const isAnswered = answeredWords.includes(value.word);
            return isAnswered ? (
              <ButtonBase
                key={value.index}
                color={TextColor.textAlternative}
                borderRadius={BorderRadius.LG}
                block
                onClick={() => {
                  removeQuizWord(value.word);
                }}
              >
                {value.word}
              </ButtonBase>
            ) : (
              <Button
                key={value.index}
                variant={ButtonVariant.Secondary}
                borderRadius={BorderRadius.LG}
                block
                onClick={() => {
                  addQuizWord(value.word);
                }}
              >
                {value.word}
              </Button>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

RecoveryPhraseChips.propTypes = {
  secretRecoveryPhrase: PropTypes.array,
  phraseRevealed: PropTypes.bool,
  revealPhrase: PropTypes.func,
  confirmPhase: PropTypes.bool,
  quizWords: PropTypes.array,
  setInputValue: PropTypes.func,
};
