import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { TextField } from '../../component-library';

export default function SrpWord({
  onRender,
  word,
  index,
  onChange,
  onNextWord,
  onDelete,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    // listen for keydown event for spacebar
    inputRef.current.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onNextWord(index, e.target.value);
      } else if (e.key === 'Backspace' && e.target.value === '') {
        onDelete(index);
      }
    });

    if (onRender) onRender(inputRef);
  }, []);

  return (
    <div className="srp-word">
      <TextField
        id={`srp-word-${index}`}
        startAccessory={index.toString()}
        value={word}
        ref={inputRef}
        onChange={onChange}
      />
    </div>
  );
}

SrpWord.propTypes = {
  onRender: PropTypes.func.isRequired,
  word: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onNextWord: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
