import EventEmitter from 'events';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Mascot from '../../../components/ui/mascot';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';
import {
  Box,
  ButtonBase,
  ButtonBaseSize,
  Text,
} from '../../../components/component-library';
import {
  Display,
  JustifyContent,
  AlignItems,
  BlockSize,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_GET_STARTED_ROUTE } from '../../../helpers/constants/routes';
import TermsOfUsePopup from '../../../components/app/terms-of-use-popup';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setTermsOfUseLastAgreed } from '../../../store/actions';

export default function Welcome() {
  const history = useHistory();
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [eventEmitter] = useState(new EventEmitter());
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

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
    dispatch(setTermsOfUseLastAgreed(new Date().getTime()));
    history.push(ONBOARDING_GET_STARTED_ROUTE);
  };

  return (
    <div className="welcome">
      <div className="welcome__wrapper">
        <div className="welcome__title">
          <Text className="welcome__title-text">{t('welcomeTitle')}</Text>
        </div>
        <div className="welcome__mascot">{renderMascot()}</div>
        <Box
          className="welcome__button-container"
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
        >
          <ButtonBase
            className="welcome__button"
            width={BlockSize.Full}
            size={ButtonBaseSize.Lg}
            onClick={() => setShowTermsOfUse(true)}
          >
            <Text
              className="welcome__button-text"
              variant={TextVariant.bodyMdMedium}
            >
              {t('welcomeGetStarted')}
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
