import React, { useState, useMemo, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import { useSelector } from 'react-redux';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  JustifyContent,
  AlignItems,
  TextVariant,
  TextColor,
  BlockSize,
} from '../../../helpers/constants/design-system';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_WELCOME_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
  ///: END:ONLY_INCLUDE_IF
} from '../../../helpers/constants/routes';
import { PASSWORD_MIN_LENGTH } from '../../../helpers/constants/common';
import ZENDESK_URLS from '../../../helpers/constants/zendesk-url';
import {
  getFirstTimeFlowType,
  getCurrentKeyring,
  getMetaMetricsId,
} from '../../../selectors';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  Box,
  Button,
  ButtonIcon,
  ButtonSize,
  ButtonVariant,
  Checkbox,
  FormTextField,
  FormTextFieldSize,
  IconName,
  Text,
} from '../../../components/component-library';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import {
  selectHasValidEncryptionKey,
  selectNodeAuthTokens,
} from '../../../selectors/seedless-onboarding';

export default function CreatePassword({
  createNewAccount,
  importWithRecoveryPhrase,
  secretRecoveryPhrase,
}) {
  const t = useI18nContext();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordStrengthText, setPasswordStrengthText] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newAccountCreationInProgress, setNewAccountCreationInProgress] =
    useState(false);
  const history = useHistory();
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const nodeAuthTokens = useSelector(selectNodeAuthTokens);
  const hasValidEncryptionKey = useSelector(selectHasValidEncryptionKey);
  const trackEvent = useContext(MetaMetricsContext);
  const currentKeyring = useSelector(getCurrentKeyring);

  const participateInMetaMetrics = useSelector((state) =>
    Boolean(state.metamask.participateInMetaMetrics),
  );
  const metametricsId = useSelector(getMetaMetricsId);
  const base64MetametricsId = Buffer.from(metametricsId ?? '').toString(
    'base64',
  );
  const shouldInjectMetametricsIframe = Boolean(
    participateInMetaMetrics && base64MetametricsId,
  );
  const analyticsIframeQuery = {
    mmi: base64MetametricsId,
    env: 'production',
  };
  const analyticsIframeUrl = `https://start.metamask.io/?${new URLSearchParams(
    analyticsIframeQuery,
  )}`;

  useEffect(() => {
    if (currentKeyring && !newAccountCreationInProgress) {
      if (
        firstTimeFlowType === FirstTimeFlowType.import ||
        firstTimeFlowType === FirstTimeFlowType.seedless
      ) {
        ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
        history.replace(ONBOARDING_COMPLETION_ROUTE);
        ///: END:ONLY_INCLUDE_IF
      } else {
        ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
        history.replace(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
        ///: END:ONLY_INCLUDE_IF
      }
    } else if (firstTimeFlowType === FirstTimeFlowType.seedless) {
      if (!nodeAuthTokens) {
        // user has not authenticated with the seedless onboarding servers,
        // redirect back to the welcome page and asks to do social login
        // Should we show a warning here?
        history.replace(ONBOARDING_WELCOME_ROUTE);
      } else if (hasValidEncryptionKey) {
        // user has already setup password and encryption key
        // redirect to the login page instead
        history.replace(ONBOARDING_UNLOCK_ROUTE);
      }
    }
  }, [
    currentKeyring,
    history,
    firstTimeFlowType,
    newAccountCreationInProgress,
    nodeAuthTokens,
    hasValidEncryptionKey,
  ]);

  const isValid = useMemo(() => {
    if (!password || !confirmPassword || password !== confirmPassword) {
      return false;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return false;
    }

    return !passwordError && !confirmPasswordError;
  }, [password, confirmPassword, passwordError, confirmPasswordError]);

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

  const handlePasswordChange = (passwordInput) => {
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

    setPassword(passwordInput);
    setPasswordStrength(passwordStrengthComponent);
    setPasswordStrengthText(passwordStrengthLabel.description);
    setConfirmPasswordError(confirmError);
  };

  const handleConfirmPasswordChange = (confirmPasswordInput) => {
    const error =
      password === confirmPasswordInput ? '' : t('passwordsDontMatch');

    setConfirmPassword(confirmPasswordInput);
    setConfirmPasswordError(error);
  };

  const handleCreate = async (event) => {
    event?.preventDefault();

    if (!isValid) {
      return;
    }

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletCreationAttempted,
    });

    // If secretRecoveryPhrase is defined we are in import wallet flow
    if (
      secretRecoveryPhrase &&
      firstTimeFlowType === FirstTimeFlowType.import
    ) {
      await importWithRecoveryPhrase(password, secretRecoveryPhrase);
      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      history.push(ONBOARDING_COMPLETION_ROUTE);
      ///: END:ONLY_INCLUDE_IF
    } else {
      // Otherwise we are in create new wallet flow
      try {
        if (createNewAccount) {
          setNewAccountCreationInProgress(true);
          await createNewAccount(password);
        }
        if (firstTimeFlowType === FirstTimeFlowType.seedless) {
          history.push(ONBOARDING_COMPLETION_ROUTE);
        } else {
          ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
          history.push(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
          ///: END:ONLY_INCLUDE_IF
        }
      } catch (error) {
        setPasswordError(error.message);
      }
    }
  };

  const createPasswordLink = (
    <a
      onClick={(e) => e.stopPropagation()}
      key="create-password__link-text"
      href={ZENDESK_URLS.PASSWORD_AND_SRP_ARTICLE}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="create-password__link-text">
        {t('learnMoreUpperCase')}
      </span>
    </a>
  );

  return (
    <div className="create-password__wrapper" data-testid="create-password">
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          Step 2 of 2
        </Text>
        <Text variant={TextVariant.headingLg}>{t('createPassword')}</Text>
      </Box>
      <Box justifyContent={JustifyContent.center}>
        <form className="create-password__form" onSubmit={handleCreate}>
          <FormTextField
            passwordStrength={passwordStrength}
            passwordStrengthText={passwordStrengthText}
            dataTestId="create-password-new"
            autoFocus
            placeholder="Use at least 8 characters"
            label="New password"
            size={FormTextFieldSize.Lg}
            value={password}
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => {
              handlePasswordChange(e.target.value);
            }}
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
            placeholder="Re-enter your password"
            label={t('confirmPassword')}
            size={FormTextFieldSize.Lg}
            value={confirmPassword}
            type={showConfirmPassword ? 'text' : 'password'}
            onChange={(e) => {
              handleConfirmPasswordChange(e.target.value);
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
          <Box
            alignItems={AlignItems.center}
            justifyContent={JustifyContent.spaceBetween}
            marginTop={4}
            marginBottom={4}
          >
            <Checkbox
              className="create-password__form__terms-checkbox"
              inputProps={{ 'data-testid': 'create-password-terms' }}
              alignItems={AlignItems.flexStart}
              isChecked={termsChecked}
              onChange={(e) => {
                e.preventDefault();
                setTermsChecked(!termsChecked);
              }}
              label={
                <Text variant={TextVariant.bodyMd} marginLeft={2}>
                  {
                    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
                    // t('passwordTermsWarning', [createPasswordLink])
                    `MetaMask can’t recover this password. ${createPasswordLink}`
                    ///: END:ONLY_INCLUDE_IF
                  }
                </Text>
              }
            />
          </Box>

          {
            ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
            <Button
              data-testid="create-password-submit"
              variant={ButtonVariant.Primary}
              width={BlockSize.Full}
              size={ButtonSize.Large}
              className="create-password__form--submit-button"
              disabled={!isValid || !termsChecked}
            >
              Confirm
            </Button>
            // <Button
            //   data-testid={
            //     secretRecoveryPhrase &&
            //     firstTimeFlowType === FirstTimeFlowType.import
            //       ? 'create-password-import'
            //       : 'create-password-wallet'
            //   }
            //   type="primary"
            //   large
            //   className="create-password-old__form--submit-button"
            //   disabled={!isValid || !termsChecked}
            //   onClick={handleCreate}
            // >
            //   {secretRecoveryPhrase &&
            //   firstTimeFlowType === FirstTimeFlowType.import
            //     ? t('importMyWallet')
            //     : t('createNewWallet')}
            // </Button>
            ///: END:ONLY_INCLUDE_IF
          }
        </form>
      </Box>
      {shouldInjectMetametricsIframe ? (
        <iframe
          src={analyticsIframeUrl}
          className="create-password__analytics-iframe"
          data-testid="create-password-iframe"
        />
      ) : null}
    </div>
  );
}

CreatePassword.propTypes = {
  createNewAccount: PropTypes.func,
  importWithRecoveryPhrase: PropTypes.func,
  secretRecoveryPhrase: PropTypes.string,
};
