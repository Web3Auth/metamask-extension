import EventEmitter from 'events';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
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
import TermsOfUsePopup from '../../../components/app/terms-of-use-popup';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setTermsOfUseLastAgreed } from '../../../store/actions';

export default function WelcomeBanner({ onAccept }: { onAccept: () => void }) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [eventEmitter] = useState(new EventEmitter());
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const onAcceptTermsOfUse = () => {
    dispatch(setTermsOfUseLastAgreed(new Date().getTime()));
    onAccept();
  };

  return (
    <div className="welcome-banner">
      <div className="welcome-banner__wrapper">
        <div className="welcome-banner__title">
          <Text className="welcome-banner__title-text" as="h2">
            {t('welcomeTitle')}
          </Text>
        </div>
        <Box
          className="welcome-banner__button-container"
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
        >
          <ButtonBase
            data-testid="onboarding-get-started-button"
            className="welcome-banner__button"
            width={BlockSize.Full}
            size={ButtonBaseSize.Lg}
            onClick={() => setShowTermsOfUse(true)}
          >
            <Text
              className="welcome-banner__button-text"
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

WelcomeBanner.propTypes = {
  onAccept: PropTypes.func.isRequired,
};
