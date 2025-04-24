import EventEmitter from 'events';
import React, { useState } from 'react';
import Mascot from '../../../components/ui/mascot';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';
import {
  Box,
  Button,
  ButtonBase,
  ButtonVariant,
  ButtonBaseSize,
} from '../../../components/component-library';
import {
  Display,
  JustifyContent,
  AlignItems,
  BlockSize,
} from '../../../helpers/constants/design-system';
import ButtonGroup from '../../../components/ui/button-group';

export default function GetStarted({}) {
  const [eventEmitter] = useState(new EventEmitter());

  const renderMascot = () => {
    if (isFlask()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="240" height="240" />
      );
    }
    if (isBeta()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="240" height="240" />
      );
    }
    return (
      <Mascot animationEventEmitter={eventEmitter} width="250" height="300" />
    );
  };

  const handleClick = () => {
    console.log('handleClick');
  };

  return (
    <div className="get-started">
      <div className="get-started__wrapper">
        {/* TODO: Use proper font */}
        <div className="get-started__title">Welcome to Metamask</div>
        <div className="get-started__mascot">{renderMascot()}</div>
        <Box
          className="get-started__button"
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
        >
          {/* TODO: Check if this is the correct button component */}
          <ButtonBase
            width={BlockSize.Full}
            variant={ButtonVariant.Secondary}
            size={ButtonBaseSize.Lg}
            onClick={handleClick}
          >
            Get started
          </ButtonBase>
        </Box>
      </div>
    </div>
  );
}

GetStarted.propTypes = {};
