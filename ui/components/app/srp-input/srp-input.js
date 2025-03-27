import React, { useState, useRef, useEffect } from 'react';
import { Textarea, TextareaResize } from '../../component-library/textarea';
import {
  BorderColor,
  BackgroundColor,
  BlockSize,
} from '../../../helpers/constants/design-system';
import { Button, ButtonVariant } from '../../component-library';
import SrpText from './srp-text';
import { parseSecretRecoveryPhrase } from './parse-secret-recovery-phrase';

const ACCEPTABLE_SRP_LENGTHS = [12, 15, 18, 21, 24];
const MAX_SRP_LENGTH = 24;

export default function SrpInput() {
  const [draftSrp, setDraftSrp] = useState([]);
  const srpRefs = useRef([]);
  const srpInputRef = useRef(null);

  // 12, 15, 18, 21, 24
  const incrementSrpLength = (currentDraftSrp) => {
    let updatedDraftSrp = currentDraftSrp;
    let arrayItemsToAdd = 0;
    const currentSrpLength = updatedDraftSrp.length;
    console.log('currentSrpLength', currentSrpLength);

    if (!ACCEPTABLE_SRP_LENGTHS.includes(currentSrpLength)) {
      // find the closest acceptable srp length
      const closestAcceptableSrpLength = ACCEPTABLE_SRP_LENGTHS.find(
        (length) => length > currentSrpLength,
      );
      arrayItemsToAdd = closestAcceptableSrpLength - currentSrpLength;
    }

    updatedDraftSrp = [
      ...updatedDraftSrp,
      ...Array(arrayItemsToAdd).fill({
        word: '',
        isActive: false,
      }),
    ];

    return updatedDraftSrp;
  };

  const setupDraftSrp = (firstWord) => {
    const updatedDraftSrp = incrementSrpLength(draftSrp);
    updatedDraftSrp[0] = { word: firstWord, isActive: false };
    updatedDraftSrp[1] = { word: '', isActive: true };
    setDraftSrp(updatedDraftSrp);
  };

  const setActive = (index) => {
    const updatedDraftSrp = [...draftSrp];
    updatedDraftSrp.forEach((srp) => {
      srp.isActive = false;
    });
    updatedDraftSrp[index] = {
      ...updatedDraftSrp[index],
      isActive: true,
    };
    setDraftSrp(updatedDraftSrp);
  };

  const onNextWord = (word, index) => {
    let updatedDraftSrp = [...draftSrp];
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
      updatedDraftSrp = incrementSrpLength(updatedDraftSrp);
    } else {
      newIndex += 1;
      updatedDraftSrp[newIndex] = {
        ...updatedDraftSrp[newIndex],
        isActive: true,
      };
    }

    setDraftSrp(updatedDraftSrp);
  };

  const onPreviousWord = (index) => {
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
  };

  const updateWord = (word, index) => {
    const updatedDraftSrp = [...draftSrp];
    updatedDraftSrp[index] = {
      word,
      isActive: false,
    };
    setDraftSrp(updatedDraftSrp);
  };

  const onSrpPaste = (rawSrp) => {
    const parsedSrp = parseSecretRecoveryPhrase(rawSrp);
    let newDraftSrp = parsedSrp.split(' ');
    const currentSrpLength = newDraftSrp.length;

    if (newDraftSrp.length > 24) {
      return;
    }

    newDraftSrp = newDraftSrp.map((word) => ({ word, isActive: false }));
    newDraftSrp = incrementSrpLength(newDraftSrp);
    newDraftSrp[currentSrpLength - 1] = {
      ...newDraftSrp[currentSrpLength - 1],
      isActive: true,
    };
    setDraftSrp(newDraftSrp);
  };

  useEffect(() => {
    const activeSrpIndex = draftSrp.findIndex((srp) => srp.isActive);
    if (activeSrpIndex >= 0) {
      srpRefs.current[activeSrpIndex].setFocus();
    }
  }, [draftSrp]);

  return (
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
            placeholder="Add a space between each word and make sure no one is watching 👀"
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
        <Button variant={ButtonVariant.Link}>Show all</Button>
        {draftSrp.length > 0 ? (
          <Button
            variant={ButtonVariant.Link}
            onClick={async () => {
              setDraftSrp([]);
            }}
          >
            Clear all
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
            Paste
          </Button>
        )}
      </div>
    </div>
  );
}
