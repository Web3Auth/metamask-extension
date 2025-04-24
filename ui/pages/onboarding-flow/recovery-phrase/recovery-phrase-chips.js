import React, { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
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
} from '../../../helpers/constants/design-system';
import SrpText from '../../../components/app/srp-input-import/srp-text';

export default function RecoveryPhraseChips({
  secretRecoveryPhrase,
  phraseRevealed,
  confirmPhase,
  setInputValue,
  inputValue,
  indicesToCheck = [],
  hiddenPhrase,
  revealPhrase,
}) {
  const t = useI18nContext();
  const hideSeedPhrase = phraseRevealed === false;
  const [selectedQuizWords, setSelectedQuizWords] = useState([]);
  const srpRefs = useRef([]);
  const shuffledPhrases = indicesToCheck.map((index) => {
    return secretRecoveryPhrase[index];
  });

  const addQuizWord = (phrase) => {
    const newSelectedQuizWords = [...selectedQuizWords];
    const targetIndex = newSelectedQuizWords.length;
    newSelectedQuizWords.push(phrase);
    setSelectedQuizWords(newSelectedQuizWords);
    srpRefs.current[indicesToCheck[targetIndex]].setQuizWord(phrase);
    setInputValue({ ...inputValue, [indicesToCheck[targetIndex]]: phrase });
  };

  useEffect(() => {
    console.log('selectedQuizWords', selectedQuizWords);
  }, [selectedQuizWords]);

  return (
    <Box
      padding={4}
      borderRadius={Size.LG}
      display={Display.Grid}
      marginBottom={4}
      className="recovery-phrase__secret"
    >
      <div
        data-testid="recovery-phrase-chips"
        className={classnames('recovery-phrase__chips', {
          'recovery-phrase__chips--hidden': hideSeedPhrase,
        })}
      >
        {secretRecoveryPhrase.map((word, index) => {
          const isDisabled = !(
            confirmPhase &&
            indicesToCheck &&
            indicesToCheck.includes(index)
          );

          let inputWord = '';

          if (confirmPhase) {
            inputWord = inputValue[index];
          } else {
            inputWord = inputValue ? inputValue[index] : word;
          }

          return (
            <div
              className={classnames('recovery-phrase__chip-item', {
                'recovery-phrase__chip-item--revealed-phase': !confirmPhase,
              })}
              key={index}
            >
              <SrpText
                dataTestId={`recovery-phrase-input-${index}`}
                ref={(el) => (srpRefs.current[index] = el)}
                word={{
                  word: inputWord,
                  isActive: true,
                }}
                index={index}
                disabled={isDisabled}
                updateWord={(value) => {
                  setInputValue({ ...inputValue, [index]: value });
                }}
              />
            </div>
          );
        })}
      </div>

      {shuffledPhrases && (
        <Box
          display={Display.Flex}
          marginTop={6}
          gap={2}
          width={BlockSize.Full}
        >
          {/* TODO: Fix text color showing primary when hovered */}
          {shuffledPhrases.map((value, index) => {
            return (
              <Button
                variant={ButtonVariant.Secondary}
                borderRadius={BorderRadius.LG}
                key={index}
                block
                disabled={selectedQuizWords.includes(value)}
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

      {hideSeedPhrase && (
        <div className="recovery-phrase__secret-blocker-container">
          <div className="recovery-phrase__secret-blocker" />
          {!hiddenPhrase && (
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
          )}
        </div>
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
  hiddenPhrase: PropTypes.bool,
  revealPhrase: PropTypes.func,
};
