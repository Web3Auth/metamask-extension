import React from 'react';
import PropTypes from 'prop-types';
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
  FontWeight,
  IconColor,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { LOGIN_TYPE, LoginType } from './types';
import { useI18nContext } from '../../../hooks/useI18nContext';

export default function LoginOptions({
  onClose,
  loginOption,
  handleLogin,
}: {
  onClose: () => void;
  loginOption: string;
  handleLogin: (loginType: LoginType) => void;
}) {
  const onLogin = (loginType: LoginType) => {
    handleLogin(loginType);
  };

  const t = useI18nContext();

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
                onClick={() => onLogin(LOGIN_TYPE.GOOGLE)}
              >
                {
                  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
                  <div className="get-started__plain-button-content">
                    <img
                      src="images/icons/google.svg"
                      className="get-started__social-icon"
                      alt="Google icon"
                    />
                    <Text
                      variant={TextVariant.bodyMd}
                      fontWeight={FontWeight.Medium}
                    >
                      {loginOption === 'existing'
                        ? t('onboardingSignInWith', ['Google'])
                        : t('onboardingContinueWith', ['Google'])}
                    </Text>
                  </div>
                  ///: END:ONLY_INCLUDE_IF
                }
              </button>
            </li>
            <li>
              <button
                className="get-started__plain-button"
                onClick={() => onLogin(LOGIN_TYPE.APPLE)}
              >
                {
                  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
                  <div className="get-started__plain-button-content">
                    <Icon
                      name={IconName.Apple}
                      color={IconColor.iconDefault}
                      size={IconSize.Lg}
                    />
                    <Text
                      variant={TextVariant.bodyMd}
                      fontWeight={FontWeight.Medium}
                    >
                      {loginOption === 'existing'
                        ? t('onboardingSignInWith', ['Apple'])
                        : t('onboardingContinueWith', ['Apple'])}
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
                onClick={() => onLogin(LOGIN_TYPE.SRP)}
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
