import React, { useEffect, useRef, useState } from 'react';
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
  Size,
  Display,
  TextColor,
  FontWeight,
  BorderRadius,
  BlockSize,
  FlexDirection,
} from '../../../helpers/constants/design-system';

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function RecoveryPhraseChips({
  secretRecoveryPhrase,
  phraseRevealed,
  confirmPhase,
  inputValue,
  indicesToCheck = [],
  revealPhrase,
  setInputValue,
}) {
  const t = useI18nContext();
  const hideSeedPhrase = phraseRevealed === false;
  const [tempInputValue, setTempInputValue] = useState(inputValue);
  const [shuffledPhrases, setShuffledPhrases] = useState([]);
  const [phrasesToDisplay, setPhrasesToDisplay] = useState([]);
  const [indexToFocus, setIndexToFocus] = useState(-1);
  const srpRefs = useRef([]);

  const setTargetIndex = (inputValues) => {
    const firstEmptyIndex = Object.values(inputValues).findIndex(
      (value) => value === '',
    );
    setIndexToFocus(firstEmptyIndex);
  };

  const addQuizWord = (phrase) => {
    if (indexToFocus !== -1) {
      const newTempInputValue = { ...tempInputValue, [indexToFocus]: phrase };
      setTempInputValue(newTempInputValue);
      setTargetIndex(newTempInputValue);
    }
  };

  const removeQuizWord = (word) => {
    const index = Object.values(tempInputValue).findIndex(
      (value) => value === word,
    );
    const newTempInputValue = {
      ...tempInputValue,
      [index]: '',
    };
    setTempInputValue(newTempInputValue);
    setTargetIndex(newTempInputValue);
  };

  useEffect(() => {
    if (indicesToCheck.length > 0 && secretRecoveryPhrase.length > 0) {
      setShuffledPhrases(
        shuffleArray(
          indicesToCheck.map((index) => {
            return secretRecoveryPhrase[index];
          }),
        ),
      );
    }
  }, [indicesToCheck, secretRecoveryPhrase]);

  useEffect(() => {
    const phrases = confirmPhase
      ? Object.values(tempInputValue)
      : secretRecoveryPhrase;

    setPhrasesToDisplay(phrases);

    if (confirmPhase) {
      setTargetIndex(phrases);
    }
  }, [confirmPhase, tempInputValue, secretRecoveryPhrase]);

  useEffect(() => {
    if (confirmPhase) {
      const hasEmptyInput = Object.values(tempInputValue).some(
        (value) => value === '',
      );
      if (!hasEmptyInput) {
        setInputValue(tempInputValue);
      }
    }
  }, [tempInputValue, setInputValue, confirmPhase]);

  return (
    <Box display={Display.Flex} flexDirection={FlexDirection.Column} gap={4}>
      <Box
        padding={4}
        borderRadius={Size.LG}
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
            return (
              <TextField
                key={index}
                ref={(el) => (srpRefs.current[index] = el)}
                value={word}
                className={`${
                  confirmPhase && indicesToCheck.includes(index)
                    ? 'mm-text-field--quiz-word'
                    : ''
                } ${
                  index === indexToFocus ? 'mm-text-field--target-index' : ''
                }`}
                type={
                  confirmPhase && !indicesToCheck.includes(index)
                    ? 'password'
                    : 'text'
                }
                startAccessory={
                  <Text
                    color={TextColor.textAlternative}
                    className="recovery-phrase__word-index"
                  >
                    {index + 1}
                  </Text>
                }
                readOnly={!hideSeedPhrase}
                disabled={confirmPhase && !indicesToCheck.includes(index)}
                onClick={() => {
                  if (!confirmPhase) {
                    return;
                  }
                  if (word && indicesToCheck.includes(index)) {
                    removeQuizWord(word);
                  } else {
                    setIndexToFocus(index);
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
                revealPhrase();
              }}
            >
              <Icon
                name={IconName.EyeSlash}
                color={TextColor.textDefault}
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

      {shuffledPhrases && shuffledPhrases.length > 0 && (
        <Box display={Display.Flex} gap={2} width={BlockSize.Full}>
          {shuffledPhrases.map((value, index) => {
            if (Object.values(tempInputValue).includes(value)) {
              return (
                <ButtonBase
                  key={index}
                  color={TextColor.textAlternative}
                  borderRadius={BorderRadius.LG}
                  block
                  onClick={() => {
                    removeQuizWord(value);
                  }}
                >
                  {value}
                </ButtonBase>
              );
            }
            return (
              <Button
                key={index}
                variant={ButtonVariant.Secondary}
                borderRadius={BorderRadius.LG}
                block
                disabled={Object.values(tempInputValue).includes(value)}
                onClick={() => {
                  addQuizWord(value);
                }}
              >
                {value}
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
  confirmPhase: PropTypes.bool,
  setInputValue: PropTypes.func,
  inputValue: PropTypes.object,
  indicesToCheck: PropTypes.array,
  revealPhrase: PropTypes.func,
};
