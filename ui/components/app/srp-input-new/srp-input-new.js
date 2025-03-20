import React, { useState } from 'react';

import { Text } from '../../component-library';
import {
  BackgroundColor,
  BlockSize,
  BorderColor,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import SrpWord from '../srp-word';
import { Textarea, TextareaResize } from '../../component-library/textarea';

export default function SrpInput() {
  const [draftSrp, setDraftSrp] = useState([]);

  const setupDraftSrp = (firstWord) => {
    setTimeout(() => {
      setDraftSrp([firstWord, '']);
    }, 100);
  };

  const onLastWordRender = (inputRef) => {
    console.log('focus');
    inputRef.current.click();
  };

  const onWordChange = (index, value) => {
    console.log('onWordChange', draftSrp);
    console.log(index, value);
    const newDraftSrp = [...draftSrp];
    newDraftSrp[index] = value;
    setDraftSrp(newDraftSrp);
  };

  const onNextWord = (index, value) => {
    const newDraftSrp = [...draftSrp];
    newDraftSrp[index] = value;
    newDraftSrp.splice(index + 1, 0, '');
    setDraftSrp(newDraftSrp);
  };

  const onDelete = (index) => {
    console.log(draftSrp);
    console.log(index);
    const newDraftSrp = [...draftSrp];
    newDraftSrp.splice(index, 1);
    setDraftSrp(newDraftSrp);
  };

  return (
    <div className="srp-input__container">
      {draftSrp.length > 0 ? (
        <div className="srp-input__srp-container">
          <div className="srp-input__words_list">
            {draftSrp.map((word, index) => (
              <SrpWord
                key={index}
                index={index}
                word={word}
                onRender={
                  index === draftSrp.length - 1 ? onLastWordRender : null
                }
                onChange={(e) => {
                  onWordChange(index, e.target.value);
                }}
                onNextWord={() => {
                  onNextWord(index);
                }}
                onDelete={() => {
                  onDelete(index);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="srp-input__srp-note" tabIndex="0">
          <Textarea
            borderColor={BorderColor.transparent}
            backgroundColor={BackgroundColor.transparent}
            width={BlockSize.Full}
            placeholder="Add a space between each word and make sure no one is watching 👀"
            rows={7}
            resize={TextareaResize.None}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setupDraftSrp(e.target.value);
              }
            }}
          />
          {/* <Text variant={TextVariant.bodySm} color={TextColor.textAlternative}>
            Add a space between each word and make sure no one is watching 👀
          </Text> */}
        </div>
      )}

      <div className="srp-input__actions">
        <div>Show all</div>
        <div>Paste</div>
      </div>
    </div>
  );
}
