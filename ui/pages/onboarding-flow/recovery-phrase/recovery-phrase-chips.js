import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  Box,
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
} from '../../../helpers/constants/design-system';
import SrpText from '../../../components/app/srp-input-import/srp-text';

export default function RecoveryPhraseChips({
  secretRecoveryPhrase,
  phraseRevealed,
  confirmPhase,
  setInputValue,
  inputValue,
  indicesToCheck,
  hiddenPhrase,
}) {
  const t = useI18nContext();
  const hideSeedPhrase = phraseRevealed === false;
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

          return (
            <div
              className={classnames('recovery-phrase__chip-item', {
                'recovery-phrase__chip-item--revealed-phase': !confirmPhase,
              })}
              key={index}
            >
              <SrpText
                dataTestId={`recovery-phrase-input-${index}`}
                word={{
                  word: inputValue ? inputValue[index] : word,
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

      {hideSeedPhrase && (
        <div className="recovery-phrase__secret-blocker-container">
          <div className="recovery-phrase__secret-blocker" />
          {!hiddenPhrase && (
            <div className="recovery-phrase__secret-blocker-text">
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
                Tap to reveal
              </Text>
              <Text variant={TextVariant.bodySm} color={TextColor.textDefault}>
                Make sure no one is watching your screen.
              </Text>
            </div>
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
};
