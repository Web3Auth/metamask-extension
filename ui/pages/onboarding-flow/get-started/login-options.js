import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { I18nContext } from '../../../contexts/i18n';
import {
  Box,
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Modal,
  ModalContent,
  ModalContentSize,
  ModalHeader,
  ModalOverlay,
  Text,
} from '../../../components/component-library';
import {
  BlockSize,
  IconColor,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';

export default function LoginOptions({ onClose, loginOption, handleLogin }) {
  const t = useContext(I18nContext);

  const onLogin = (loginType) => {
    handleLogin(loginType);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="options-modal"
      isClosedOnOutsideClick={false}
    >
      <ModalOverlay />
      <ModalContent size={ModalContentSize.Sm}>
        <ModalHeader onClose={onClose}>
          <Text textAlign={TextAlign.Center} variant={TextVariant.headingMd}>
            {t('onboardingOptionTitle')}
          </Text>
        </ModalHeader>
        <Box>
          <ul className="get-started__buttons get-started__buttons--modal">
            <li>
              <button
                className="get-started__plain-button"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                onClick={() => onLogin('google')}
              >
                {
                  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
                  <div className="get-started__plain-button-content">
                    <img
                      src="images/icons/google.svg"
                      className="get-started__social-icon"
                      alt="Google icon"
                    />
                    <Text variant={TextVariant.bodyMd}>
                      {t('onboardingContinueWith', 'Google')}
                    </Text>
                  </div>
                  ///: END:ONLY_INCLUDE_IF
                }
              </button>
            </li>
            <li>
              <button
                className="get-started__plain-button"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                onClick={() => onLogin('apple')}
              >
                {
                  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
                  <div className="get-started__plain-button-content">
                    <Icon
                      name={IconName.Apple}
                      color={IconColor.iconDefault}
                      size={IconSize.Lg}
                    />
                    <Text variant={TextVariant.bodyMd}>
                      {t('onboardingContinueWith', 'Apple')}
                    </Text>
                  </div>
                  ///: END:ONLY_INCLUDE_IF
                }
              </button>
            </li>
            <li>
              <div className="get-started__or">
                <Text
                  className="get-started__or-text"
                  variant={TextVariant.bodyMd}
                  color={TextColor.textMuted}
                  as="div"
                >
                  {t('or')}
                </Text>
              </div>
            </li>
            <li>
              <Button
                data-testid="onboarding-create-wallet"
                variant={ButtonVariant.Secondary}
                width={BlockSize.Full}
                size={ButtonSize.Lg}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                onClick={() => onLogin('srp')}
              >
                {loginOption === 'existing'
                  ? t('onboardingSrpImport')
                  : t('onboardingSrpCreate')}
              </Button>
            </li>
          </ul>
        </Box>
      </ModalContent>
    </Modal>
  );
}

LoginOptions.propTypes = {
  onClose: PropTypes.func.isRequired,
  loginOption: PropTypes.string.isRequired,
  handleLogin: PropTypes.func.isRequired,
};
