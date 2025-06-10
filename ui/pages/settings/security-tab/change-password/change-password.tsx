import EventEmitter from 'events';
import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  FormTextField,
  Text,
  TextFieldType,
} from '../../../../components/component-library';
import {
  AlignItems,
  BlockSize,
  Display,
  FlexDirection,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { isBeta, isFlask } from '../../../../helpers/utils/build-types';
import Mascot from '../../../../components/ui/mascot';
import Spinner from '../../../../components/ui/spinner';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { changePassword, verifyPassword } from '../../../../store/actions';
import PasswordForm from '../../../../components/app/password-form/password-form';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../shared/constants/metametrics';
import ChangePasswordWarning from './change-password-warning';

const ChangePasswordSteps = {
  VerifyCurrentPassword: 1,
  ChangePassword: 2,
  CreatingPassword: 3,
};

const ChangePassword = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEvent = useContext(MetaMetricsContext);
  const [eventEmitter] = useState(new EventEmitter());
  const [step, setStep] = useState(ChangePasswordSteps.VerifyCurrentPassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [isIncorrectPasswordError, setIsIncorrectPasswordError] =
    useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [showChangePasswordWarning, setShowChangePasswordWarning] =
    useState(false);

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

  const handleSubmitCurrentPassword = async () => {
    try {
      await verifyPassword(currentPassword);
      setIsIncorrectPasswordError(false);
      setStep(ChangePasswordSteps.ChangePassword);
    } catch (error) {
      setIsIncorrectPasswordError(true);
    }
  };

  const onChangePassword = async () => {
    try {
      setShowChangePasswordWarning(false);
      setStep(ChangePasswordSteps.CreatingPassword);
      await dispatch(changePassword(newPassword, currentPassword));

      // Track password changed event
      trackEvent({
        category: MetaMetricsEventCategory.Settings,
        event: MetaMetricsEventName.PasswordChanged,
        properties: {
          biometrics_enabled: false,
        },
      });

      // upon successful password change, go back to the settings page
      history.goBack();
    } catch (error) {
      console.error(error);
      setStep(ChangePasswordSteps.VerifyCurrentPassword);
    }
  };

  const onSubmitChangePasswordForm = () => {
    if (!newPassword) {
      return;
    }
    setShowChangePasswordWarning(true);
  };

  return (
    <Box padding={4} className="change-password">
      {step === ChangePasswordSteps.VerifyCurrentPassword && (
        <Box
          as="form"
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={6}
          justifyContent={JustifyContent.spaceBetween}
          height={BlockSize.Full}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitCurrentPassword();
          }}
        >
          <FormTextField
            id="current-password"
            label={t('enterPasswordContinue')}
            placeholder={t('makeSureNoOneWatching')}
            textFieldProps={{ type: TextFieldType.Password }}
            labelProps={{
              marginBottom: 1,
              children: t('enterPasswordContinue'),
            }}
            value={currentPassword}
            error={isIncorrectPasswordError}
            helpText={
              isIncorrectPasswordError ? t('unlockPageIncorrectPassword') : null
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
      )}

      {step === ChangePasswordSteps.ChangePassword && (
        <Box
          as="form"
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={6}
          justifyContent={JustifyContent.spaceBetween}
          height={BlockSize.Full}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitChangePasswordForm();
          }}
        >
          <Box>
            <PasswordForm onChange={(password) => setNewPassword(password)} />
          </Box>
          <Button type="submit" disabled={!newPassword} block>
            {t('save')}
          </Button>
        </Box>
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
            onChangePassword();
          }}
          onCancel={() => setShowChangePasswordWarning(false)}
        />
      )}
    </Box>
  );
};

export default ChangePassword;
