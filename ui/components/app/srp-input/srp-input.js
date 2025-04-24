import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { isValidMnemonic } from '@ethersproject/hdnode';
import { Textarea, TextareaResize } from '../../component-library/textarea';
import {
  BorderColor,
  BackgroundColor,
  BlockSize,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { Box, Button, ButtonVariant, Text } from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SrpText from './srp-text';
import { parseSecretRecoveryPhrase } from './parse-secret-recovery-phrase';

const defaultNumberOfWords = 12;

const hasUpperCase = (draftSrp) => {
  return draftSrp !== draftSrp.toLowerCase();
};

export default function SrpInput({ onChange }) {
  const t = useI18nContext();
  const [srpError, setSrpError] = useState('');
  const [draftSrp, setDraftSrp] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const srpRefs = useRef([]);
  const srpInputRef = useRef(null);

  // 12, 15, 18, 21, 24
  // TODO: verify if we don't need this
  // eslint-disable-next-line no-unused-vars
  const incrementSrpLength = (currentDraftSrp) => {
    let updatedDraftSrp = currentDraftSrp;
    let arrayItemsToAdd = 0;
    const currentSrpLength = updatedDraftSrp.length;
    console.log('currentSrpLength', currentSrpLength);

  const t = useI18nContext();

  const onSrpChange = useCallback(
    (newDraftSrp) => {
      let newSrpError = '';
      const joinedDraftSrp = newDraftSrp.join(' ').trim();

      if (newDraftSrp.some((word) => word !== '')) {
        if (newDraftSrp.some((word) => word === '')) {
          newSrpError = t('seedPhraseReq');
        } else if (hasUpperCase(joinedDraftSrp)) {
          newSrpError = t('invalidSeedPhraseCaseSensitive');
        } else if (!isValidMnemonic(joinedDraftSrp)) {
          newSrpError = t('invalidSeedPhrase');
        }
      }

  const setupDraftSrp = useCallback(
    (firstWord) => {
      // const updatedDraftSrp = incrementSrpLength(draftSrp);
      const updatedDraftSrp = [...draftSrp];
      updatedDraftSrp[0] = { word: firstWord, isActive: false };
      updatedDraftSrp[1] = { word: '', isActive: true };
      setDraftSrp(updatedDraftSrp);
    },
    [draftSrp, setDraftSrp],
  );

  const setActive = useCallback(
    (index) => {
      const updatedDraftSrp = [...draftSrp];
      updatedDraftSrp.forEach((srp) => {
        srp.isActive = false;
      });
      updatedDraftSrp[index] = {
        ...updatedDraftSrp[index],
        isActive: true,
      };
      setDraftSrp(updatedDraftSrp);
    },
    [draftSrp, setDraftSrp],
  );

  const onNextWord = useCallback(
    (word, index) => {
      const updatedDraftSrp = [...draftSrp];
      let newIndex = index;
      updatedDraftSrp[index] = {
        word,
        isActive: false,
      };

      const isLastWord = newIndex + 1 >= updatedDraftSrp.length;

      if (isLastWord && updatedDraftSrp.length < MAX_SRP_LENGTH) {
        updatedDraftSrp[newIndex + 1] = {
          word: '',
          isActive: true,
        };
        // updatedDraftSrp = incrementSrpLength(updatedDraftSrp);
      } else {
        newIndex += 1;
        updatedDraftSrp[newIndex] = {
          ...updatedDraftSrp[newIndex],
          isActive: true,
        };
      }

      setDraftSrp(updatedDraftSrp);
    },
    [draftSrp, setDraftSrp],
  );

  const onPreviousWord = useCallback(
    (index) => {
      const updatedDraftSrp = [...draftSrp];
      updatedDraftSrp[index] = {
        word: '',
        isActive: false,
      };
      if (index > 0) {
        updatedDraftSrp[index - 1] = {
          ...updatedDraftSrp[index - 1],
          isActive: true,
        };
      }
      setDraftSrp(updatedDraftSrp);
    },
    [draftSrp, setDraftSrp],
  );

  const updateWord = useCallback(
    (word, index) => {
      const updatedDraftSrp = [...draftSrp];
      updatedDraftSrp[index] = { word, isActive: false };
      setDraftSrp(updatedDraftSrp);
    },
    [draftSrp, setDraftSrp],
  );

  const onSrpPaste = useCallback(
    (rawSrp) => {
      const parsedSrp = parseSecretRecoveryPhrase(rawSrp);
      let newDraftSrp = parsedSrp.split(' ');
      const currentSrpLength = newDraftSrp.length;

      if (newDraftSrp.length > 24) {
        return;
      }

      newDraftSrp = newDraftSrp.map((word) => ({ word, isActive: false }));
      // newDraftSrp = incrementSrpLength(newDraftSrp);
      newDraftSrp[currentSrpLength - 1] = {
        ...newDraftSrp[currentSrpLength - 1],
        isActive: true,
      };
      setDraftSrp(newDraftSrp);
    },
    [setDraftSrp],
  );

  const validateSrp = useCallback(
    (newDraftSrp) => {
      let newSrpError = '';
      const joinedDraftSrp = newDraftSrp
        .map((word) => word.word)
        .join(' ')
        .trim();

      if (newDraftSrp.some((word) => word.word !== '')) {
        if (newDraftSrp.some((word) => word.word === '')) {
          newSrpError = t('seedPhraseReq');
        } else if (hasUpperCase(joinedDraftSrp)) {
          newSrpError = t('invalidSeedPhraseCaseSensitive');
        } else if (!isValidMnemonic(joinedDraftSrp)) {
          newSrpError = t('invalidSeedPhrase');
        }
      }

      setSrpError(newSrpError);
      onChange(newSrpError ? '' : joinedDraftSrp);
    },
    [setSrpError, onChange, t],
  );

  useEffect(() => {
    const activeSrpIndex = draftSrp.findIndex((srp) => srp.isActive);
    if (activeSrpIndex >= 0) {
      srpRefs.current[activeSrpIndex].setFocus();
    }

    // validate the srp
    validateSrp(draftSrp);
  }, [draftSrp, validateSrp]);

  return (
    <>
      <div className="srp-input__container">
        {draftSrp.length > 0 ? (
          <div className="srp-input__srp-container">
            <div className="srp-input__words-list">
              {draftSrp.map((word, index) => (
                <SrpText
                  key={index}
                  index={index}
                  ref={(el) => (srpRefs.current[index] = el)}
                  word={word}
                  forceShow={showAll}
                  onNextWord={onNextWord}
                  onPreviousWord={onPreviousWord}
                  updateWord={updateWord}
                  setActive={setActive}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="srp-input__srp-note">
            <Textarea
              ref={srpInputRef}
              className="srp-input__initial-input"
              borderColor={BorderColor.transparent}
              backgroundColor={BackgroundColor.transparent}
              width={BlockSize.Full}
              placeholder={`${t('onboardingSrpInputPlaceholder')} 👀`}
              rows={7}
              resize={TextareaResize.None}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setupDraftSrp(e.target.value);
                }
              }}
              onPaste={(e) => {
                const newSrp = e.clipboardData.getData('text');
                if (newSrp.trim().match(/\s/u)) {
                  e.preventDefault();
                  onSrpPaste(newSrp);
                }
              }}
            />
          </div>
        )}

        <div className="srp-input__actions">
          <Button
            variant={ButtonVariant.Link}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? t('onboardingSrpInputHideAll')
              : t('onboardingSrpInputShowAll')}
          </Button>
          {draftSrp.length > 0 ? (
            <Button
              variant={ButtonVariant.Link}
              onClick={async () => {
                setDraftSrp([]);
              }}
            >
              {t('onboardingSrpInputClearAll')}
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.Link}
              onClick={async () => {
                // TODO: this requires user permission
                const newSrp = await window.navigator.clipboard.readText();
                if (newSrp.trim().match(/\s/u)) {
                  onSrpPaste(newSrp);
                }
              }}
            >
              {t('paste')}
            </Button>
          )}
        </div>
      </div>
      {srpError && (
        <Box marginTop={2}>
          <Text variant={TextVariant.bodySm} color={TextColor.errorDefault}>
            {srpError}
          </Text>
        </Box>
      )}
    </>
  );
}

SrpInput.propTypes = {
  /**
   * Event handler for SRP changes.
   *
   * This is only called with a valid, well-formated (i.e. exactly one space
   * between each word) SRP or with an empty string.
   *
   * This is called each time the draft SRP is updated. If the draft SRP is
   * valid, this is called with a well-formatted version of that draft SRP.
   * Otherwise, this is called with an empty string.
   */
  onChange: PropTypes.func.isRequired,
};
