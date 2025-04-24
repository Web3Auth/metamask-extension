import { isValidMnemonic } from '@ethersproject/hdnode';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';
import TextField from '../../ui/text-field';
import { clearClipboard } from '../../../helpers/utils/util';
import { BannerAlert, Text } from '../../component-library';
import Dropdown from '../../ui/dropdown';
import ShowHideToggle from '../../ui/show-hide-toggle';
import {
  TextAlign,
  TextVariant,
  Severity,
} from '../../../helpers/constants/design-system';
import { parseSecretRecoveryPhrase } from './parse-secret-recovery-phrase';

const defaultNumberOfWords = 12;

const hasUpperCase = (draftSrp) => {
  return draftSrp !== draftSrp.toLowerCase();
};

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

  const setupDraftSrp = (firstWord) => {
    // const updatedDraftSrp = incrementSrpLength(draftSrp);
    const updatedDraftSrp = [...draftSrp];
    updatedDraftSrp[0] = { word: firstWord, isActive: false };
    updatedDraftSrp[1] = { word: '', isActive: true };
    setDraftSrp(updatedDraftSrp);
  };

  const toggleShowSrp = useCallback((index) => {
    setShowSrp((currentShowSrp) => {
      const newShowSrp = currentShowSrp.slice();
      if (newShowSrp[index]) {
        newShowSrp[index] = false;
      } else {
        newShowSrp.fill(false);
        newShowSrp[index] = true;
      }
      return newShowSrp;
    });
  }, []);

  const onNextWord = (word, index) => {
    const updatedDraftSrp = [...draftSrp];
    let newIndex = index;
    updatedDraftSrp[index] = {
      word,
      isActive: false,
    };

  const onSrpPaste = useCallback(
    (rawSrp) => {
      const parsedSrp = parseSecretRecoveryPhrase(rawSrp);
      let newDraftSrp = parsedSrp.split(' ');

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

      let newNumberOfWords = numberOfWords;
      if (newDraftSrp.length !== numberOfWords) {
        if (newDraftSrp.length < 12) {
          newNumberOfWords = 12;
        } else if (newDraftSrp.length % 3 === 0) {
          newNumberOfWords = newDraftSrp.length;
        } else {
          newNumberOfWords =
            newDraftSrp.length + (3 - (newDraftSrp.length % 3));
        }
        setNumberOfWords(newNumberOfWords);
      }

      if (newDraftSrp.length < newNumberOfWords) {
        newDraftSrp = newDraftSrp.concat(
          new Array(newNumberOfWords - newDraftSrp.length).fill(''),
        );
      }
      setShowSrp(new Array(newNumberOfWords).fill(false));
      onSrpChange(newDraftSrp);
      clearClipboard();
    },
    [numberOfWords, onSrpChange, pasteFailed, setPasteFailed],
  );

  const numberOfWordsOptions = [];
  for (let i = 12; i <= 24; i += 3) {
    numberOfWordsOptions.push({
      name: t('srpInputNumberOfWords', [`${i}`]),
      value: `${i}`,
    });
  }

  const handleNumberOfWordsChange = useCallback(
    (newSelectedOption) => {
      const newNumberOfWords = parseInt(newSelectedOption, 10);
      if (Number.isNaN(newNumberOfWords)) {
        throw new Error('Unable to parse option as integer');
      }

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
  };

  useEffect(() => {
    const activeSrpIndex = draftSrp.findIndex((srp) => srp.isActive);
    if (activeSrpIndex >= 0) {
      srpRefs.current[activeSrpIndex].setFocus();
    }
  }, [draftSrp]);

  return (
    <div className="import-srp__container">
      <div className="import-srp__dropdown-container">
        <label className="import-srp__srp-label">
          {srpText && (
            <Text
              align={TextAlign.Left}
              variant={TextVariant.headingSm}
              as="h4"
            >
              {srpText}
            </Text>
          )}
        </label>
        <BannerAlert
          className="import-srp__paste-tip"
          severity={Severity.Info}
          description={t('srpPasteTip')}
          descriptionProps={{ className: 'import-srp__banner-alert-text' }}
        />
        <Dropdown
          className="import-srp__number-of-words-dropdown"
          onChange={handleNumberOfWordsChange}
          options={numberOfWordsOptions}
          selectedOption={`${numberOfWords}`}
        />
      </div>
      <div className="import-srp__srp">
        {[...Array(numberOfWords).keys()].map((index) => {
          const id = `import-srp__srp-word-${index}`;
          return (
            <div key={index} className="import-srp__srp-word">
              <label htmlFor={id} className="import-srp__srp-word-label">
                <Text>{`${index + 1}.`}</Text>
              </label>
              <TextField
                id={id}
                data-testid={id}
                type={showSrp[index] ? 'text' : 'password'}
                onChange={(e) => {
                  e.preventDefault();
                  onSrpWordChange(index, e.target.value);
                }}
                value={draftSrp[index]}
                autoComplete="off"
                onPaste={(event) => {
                  const newSrp = event.clipboardData.getData('text');

                  if (newSrp.trim().match(/\s/u)) {
                    event.preventDefault();
                    onSrpPaste(newSrp);
                  }
                }}
              />
              <ShowHideToggle
                id={`${id}-checkbox`}
                ariaLabelHidden={t('srpWordHidden')}
                ariaLabelShown={t('srpWordShown')}
                shown={showSrp[index]}
                data-testid={`${id}-checkbox`}
                onChange={() => toggleShowSrp(index)}
                title={t('srpToggleShow')}
              />
            </div>
          );
        })}
      </div>
      {srpError ? (
        <BannerAlert
          className="import-srp__srp-error"
          severity={Severity.Danger}
          description={srpError}
          descriptionProps={{ className: 'import-srp__banner-alert-text' }}
        />
      ) : null}
      {pasteFailed ? (
        <BannerAlert
          className="import-srp__srp-too-many-words-error"
          severity={Severity.Danger}
          actionButtonLabel={t('dismiss')}
          actionButtonOnClick={() => setPasteFailed(false)}
          description={t('srpPasteFailedTooManyWords')}
          descriptionProps={{ className: 'import-srp__banner-alert-text' }}
        />
      ) : null}
    </div>
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
  /**
   * Text to show on the left of the Dropdown component. Wrapped in Typography component.
   */
  srpText: PropTypes.string.isRequired,
};
