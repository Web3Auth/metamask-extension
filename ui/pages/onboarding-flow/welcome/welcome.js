import EventEmitter from 'events';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Mascot from '../../../components/ui/mascot';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';
import {
  Box,
  ButtonBase,
  ButtonVariant,
  ButtonBaseSize,
  Text,
} from '../../../components/component-library';
import {
  Display,
  JustifyContent,
  AlignItems,
  BlockSize,
  TextVariant,
  TextColor,
  FontWeight,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_GET_STARTED_ROUTE } from '../../../helpers/constants/routes';
import TermsOfUsePopup from '../../../components/app/terms-of-use-popup';

export default function Welcome() {
  const [eventEmitter] = useState(new EventEmitter());
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const history = useHistory();

  const renderMascot = () => {
    if (isFlask()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="300" height="300" />
      );
    }
    if (isBeta()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="300" height="300" />
      );
    }
    return (
      <Mascot animationEventEmitter={eventEmitter} width="332" height="332" />
    );
  };

  const onAcceptTermsOfUse = () => {
    history.push(ONBOARDING_GET_STARTED_ROUTE);
  };

  return (
    <div className="welcome">
      <div className="welcome__wrapper">
        {/* TODO: Use proper font */}
        <div className="welcome__title">
          <Text
            className="welcome__title-text"
            variant={TextVariant.headingLg}
            color={TextColor.primaryDefault}
          >
            Welcome to Metamask
          </Text>
        </div>
        <div className="welcome__mascot">{renderMascot()}</div>
        <Box
          className="welcome__button-container"
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
        >
          {/* TODO: Check if this is the correct button component */}
          <ButtonBase
            className="welcome__button"
            width={BlockSize.Full}
            variant={ButtonVariant.Primary}
            size={ButtonBaseSize.Lg}
            onClick={() => setShowTermsOfUse(true)}
          >
            <Text
              className="welcome__button-text"
              variant={TextVariant.bodyMd}
              fontWeight={FontWeight.Medium}
            >
              Get started
            </Text>
          </ButtonBase>
        </Box>
      </div>
      <TermsOfUsePopup
        isOpen={showTermsOfUse}
        onClose={() => setShowTermsOfUse(false)}
        onAccept={() => {
          setShowTermsOfUse(false);
          onAcceptTermsOfUse();
        }}
      />
    </div>
  );
}

Welcome.propTypes = {};
