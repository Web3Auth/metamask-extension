import EventEmitter from 'events';
import React, { useMemo, useState } from 'react';
import zxcvbn from 'zxcvbn';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  ButtonIcon,
  FormTextField,
  FormTextFieldSize,
  IconName,
  Text,
  TextFieldType,
} from '../../../../components/component-library';
import {
  AlignItems,
  Display,
  FlexDirection,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { isBeta, isFlask } from '../../../../helpers/utils/build-types';
import Mascot from '../../../../components/ui/mascot';
import Spinner from '../../../../components/ui/spinner';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { PASSWORD_MIN_LENGTH } from '../../../../helpers/constants/common';
import { changePassword, verifyPassword } from '../../../../store/actions';
import ChangePasswordWarning from './change-password-warning';

const ChangePasswordSteps = {
  CurrentPassword: 1,
  ChangePassword: 2,
  CreatingPassword: 3,
};

const ChangePassword = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [eventEmitter] = useState(new EventEmitter());
  const [step, setStep] = useState(ChangePasswordSteps.ChangePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [isIncorrectPasswordError, setIsIncorrectPasswordError] =
    useState(false);

  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordStrengthText, setPasswordStrengthText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangePasswordWarning, setShowChangePasswordWarning] =
    useState(false);

  const getPasswordStrengthLabel = (isTooShort, score) => {
    if (isTooShort) {
      return {
        className: 'create-password__weak',
        dataTestId: 'short-password-error',
        text: t('passwordNotLongEnough'),
        description: '',
      };
    }
    if (score >= 4) {
      return {
        className: 'create-password__strong',
        dataTestId: 'strong-password',
        text: t('strong'),
        description: '',
      };
    }
    if (score === 3) {
      return {
        className: 'create-password__average',
        dataTestId: 'average-password',
        text: t('average'),
        description: t('passwordStrengthDescription'),
      };
    }
    return {
      className: 'create-password__weak',
      dataTestId: 'weak-password',
      text: t('weak'),
      description: t('passwordStrengthDescription'),
    };
  };

  const handleNewPasswordChange = (passwordInput) => {
    const isTooShort =
      passwordInput.length && passwordInput.length < PASSWORD_MIN_LENGTH;
    const { score } = zxcvbn(passwordInput);
    const passwordStrengthLabel = getPasswordStrengthLabel(isTooShort, score);
    const passwordStrengthComponent = t('passwordStrength', [
      <span
        key={score}
        data-testid={passwordStrengthLabel.dataTestId}
        className={passwordStrengthLabel.className}
      >
        {passwordStrengthLabel.text}
      </span>,
    ]);
    const confirmError =
      !confirmPassword || passwordInput === confirmPassword
        ? ''
        : t('passwordsDontMatch');

    setNewPassword(passwordInput);
    setPasswordStrength(passwordStrengthComponent);
    setPasswordStrengthText(passwordStrengthLabel.description);
    setConfirmPasswordError(confirmError);
  };

  const handleConfirmNewPasswordChange = (confirmPasswordInput) => {
    const error =
      newPassword === confirmPasswordInput ? '' : t('passwordsDontMatch');

    setConfirmPassword(confirmPasswordInput);
    setConfirmPasswordError(error);
  };

  const renderMascot = () => {
    if (isFlask()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="100" height="100" />
      );
    }
    if (isBeta()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="100" height="100" />
      );
    }
    return (
      <Mascot animationEventEmitter={eventEmitter} width="100" height="100" />
    );
  };

  const isValid = useMemo(() => {
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      return false;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return false;
    }

    return !confirmPasswordError;
  }, [newPassword, confirmPassword, confirmPasswordError]);

  const handleSubmitCurrentPassword = async () => {
    try {
      await verifyPassword(currentPassword);
      setIsIncorrectPasswordError(false);
      setStep(ChangePasswordSteps.ChangePassword);
    } catch (error) {
      setIsIncorrectPasswordError(true);
    }
  };

  const handleSubmitNewPassword = async () => {
    if (!isValid) {
      return;
    }

    try {
      setStep(ChangePasswordSteps.CreatingPassword);
      await dispatch(changePassword(newPassword, currentPassword));

      // upon successful password change, go back to the settings page
      history.goBack();
    } catch (error) {
      setIsIncorrectPasswordError(true);
    } finally {
      setStep(ChangePasswordSteps.CreatingPassword);
    }
  };
  return (
    <div className="change-password">
      {step === ChangePasswordSteps.CurrentPassword && (
        <form
          className="change-password__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitCurrentPassword();
          }}
        >
          <Box className="change-password__form-container">
            <FormTextField
              id="current-password"
              label={t('enterPasswordContinue')}
              placeholder={t('makeSureNoOneWatching')}
              textFieldProps={{ type: TextFieldType.Password }}
              labelProps={{ marginBottom: 1 }}
              value={currentPassword}
              error={isIncorrectPasswordError}
              helpText={
                isIncorrectPasswordError
                  ? t('unlockPageIncorrectPassword')
                  : null
              }
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setIsIncorrectPasswordError(false);
              }}
            />

            <Button
              type="submit"
              block
              disabled={isIncorrectPasswordError || !currentPassword}
            >
              {t('save')}
            </Button>
          </Box>
        </form>
      )}

      {step === ChangePasswordSteps.ChangePassword && (
        <form
          className="change-password__form"
          onSubmit={(e) => {
            e.preventDefault();
            setShowChangePasswordWarning(true);
          }}
        >
          <Box className="change-password__form-container">
            <div className="change-password__form-container__content">
              <FormTextField
                dataTestId="change-password-new"
                passwordStrength={passwordStrength}
                passwordStrengthText={passwordStrengthText}
                autoFocus
                placeholder={t('newPasswordPlaceholder')}
                label={t('newPassword')}
                labelProps={{ marginBottom: 1 }}
                size={FormTextFieldSize.Lg}
                value={newPassword}
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => {
                  handleNewPasswordChange(e.target.value);
                }}
                helpText={
                  (passwordStrength || passwordStrengthText) && (
                    <Box>
                      {passwordStrength && (
                        <Text as="div" variant={TextVariant.inherit}>
                          {passwordStrength}
                        </Text>
                      )}
                      {passwordStrengthText && (
                        <Text as="div" variant={TextVariant.inherit}>
                          {passwordStrengthText}
                        </Text>
                      )}
                    </Box>
                  )
                }
                endAccessory={
                  <ButtonIcon
                    iconName={showPassword ? IconName.EyeSlash : IconName.Eye}
                    data-testid="show-password"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                  />
                }
              />

              <FormTextField
                dataTestId="create-password-confirm"
                marginTop={4}
                placeholder={t('confirmPasswordPlaceholder')}
                label={t('confirmPassword')}
                labelProps={{ marginBottom: 1 }}
                size={FormTextFieldSize.Lg}
                error={Boolean(confirmPasswordError)}
                helpText={confirmPasswordError}
                value={confirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                onChange={(e) => {
                  handleConfirmNewPasswordChange(e.target.value);
                }}
                endAccessory={
                  <ButtonIcon
                    iconName={
                      showConfirmPassword ? IconName.EyeSlash : IconName.Eye
                    }
                    data-testid="show-password"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                  />
                }
              />
            </div>
            <Button type="submit" disabled={!isValid} block>
              {t('save')}
            </Button>
          </Box>
        </form>
      )}

      {step === ChangePasswordSteps.CreatingPassword && (
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          alignItems={AlignItems.center}
          marginTop={12}
        >
          <div>{renderMascot()}</div>
          <Spinner className="change-password__spinner" />
          <Text variant={TextVariant.bodyLgMedium} marginBottom={4}>
            {t('createPasswordCreating')}
          </Text>
          <Text variant={TextVariant.bodySm} color={TextColor.textAlternative}>
            {t('createPasswordCreatingNote')}
          </Text>
        </Box>
      )}
      {showChangePasswordWarning && (
        <ChangePasswordWarning
          onConfirm={() => {
            handleSubmitNewPassword();
            setShowChangePasswordWarning(false);
          }}
          onCancel={() => setShowChangePasswordWarning(false)}
        />
      )}
    </div>
  );
};

export default ChangePassword;
