import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from 'react';
import PropTypes from 'prop-types';
import { TextField, Text } from '../../component-library';
import {
  BlockSize,
  TextVariant,
  TextColor,
  BorderRadius,
} from '../../../helpers/constants/design-system';

const SrpText = forwardRef((props, ref) => {
  const [tempWord, setTempWord] = useState(props.word.word);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setFocus: () => {
      inputRef.current.click();
    },
  }));

  const onChange = (e) => {
    setTempWord(e.target.value);
  };

  const wordLabel = () => {
    return (
      <Text variant={TextVariant.bodySm} color={TextColor.textAlternative}>
        {props.index + 1}.
      </Text>
    );
  };

  return (
    <TextField
      ref={inputRef}
      value={tempWord}
      disabled={props.disabled}
      borderRadius={BorderRadius.LG}
      type={props.word.isActive ? 'text' : 'password'}
      width={BlockSize.Full}
      startAccessory={wordLabel()}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('tempWord', tempWord);
          props.onNextWord(tempWord, props.index);
        } else if (e.key === 'Backspace' && tempWord.length === 0) {
          e.preventDefault();
          props.onPreviousWord(props.index);
        }
      }}
      onBlur={() => {
        props.updateWord(tempWord, props.index);
      }}
      onFocus={() => {
        props.setActive(props.index);
      }}
    />
  );
});

SrpText.propTypes = {
  word: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onNextWord: PropTypes.func,
  onPreviousWord: PropTypes.func,
  updateWord: PropTypes.func,
  setActive: PropTypes.func,
  disabled: PropTypes.bool,
};

SrpText.displayName = 'SrpText';

export default SrpText;
