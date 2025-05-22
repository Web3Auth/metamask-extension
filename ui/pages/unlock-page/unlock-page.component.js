import { EventEmitter } from 'events';
import React, { Component, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SeedlessOnboardingControllerError } from '@metamask/seedless-onboarding-controller';
import {
  Text,
  FormTextField,
  Box,
  ButtonLink,
  Button,
  ButtonSize,
  ButtonVariant,
  InputType,
  FormTextFieldSize,
} from '../../components/component-library';
import {
  TextVariant,
  TextColor,
  BlockSize,
  BorderRadius,
  Display,
  JustifyContent,
  AlignItems,
  FlexDirection,
  TextAlign,
} from '../../helpers/constants/design-system';
import Mascot from '../../components/ui/mascot';
import {
  DEFAULT_ROUTE,
  ONBOARDING_CREATE_PASSWORD_ROUTE,
} from '../../helpers/constants/routes';
import {
  MetaMetricsContextProp,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../shared/constants/metametrics';
import { isFlask, isBeta } from '../../helpers/utils/build-types';
import { SUPPORT_LINK } from '../../../shared/lib/ui-utils';
import {
  TraceName,
  TraceOperation,
  bufferedTrace,
  bufferedEndTrace,
} from '../../../shared/lib/trace';
import { getCaretCoordinates } from './unlock-page.util';
import ResetPasswordModal from './reset-password-modal';

const formatTimeToUnlock = (timeInSeconds) => {
  if (timeInSeconds <= 60) {
    return `${timeInSeconds}s`;
  } else if (timeInSeconds < 3600) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}m:${seconds.toString().padStart(2, '0')}s`;
  }
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${hours}hr:${minutes.toString().padStart(2, '0')}m:${seconds
    .toString()
    .padStart(2, '0')}s`;
};

function Counter({ remainingTime, unlock }) {
  const [time, setTime] = useState(remainingTime);
  const [timeDisplay, setTimeDisplay] = useState(
    formatTimeToUnlock(remainingTime),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = time - 1;
      if (newTime < 0) {
        unlock();
      } else {
        setTime(newTime);
        setTimeDisplay(formatTimeToUnlock(newTime));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [time, unlock]);

  return <span>{timeDisplay}</span>;
}

Counter.propTypes = {
  remainingTime: PropTypes.number.isRequired,
  unlock: PropTypes.func.isRequired,
};

export default class UnlockPage extends Component {
  static contextTypes = {
    trackEvent: PropTypes.func,
    t: PropTypes.func,
  };

  static propTypes = {
    /**
     * History router for redirect after action
     */
    history: PropTypes.object.isRequired,
    /**
     * Location object from react-router
     */
    location: PropTypes.shape({
      state: PropTypes.object,
    }),
    /**
     * If isUnlocked is true will redirect to most recent route in history
     */
    isUnlocked: PropTypes.bool,
    /**
     * Whether the seedless password is outdated
     */
    isSeedlessPasswordOutdated: PropTypes.bool,
    /**
     * onClick handler for "Forgot password?" button
     */
    onRestore: PropTypes.func,
    /**
     * onSubmit handler when form is submitted
     */
    onSubmit: PropTypes.func,
    /**
     * Force update metamask data state
     */
    forceUpdateMetamaskState: PropTypes.func,
    /**
     * Whether social login is enabled
     */
    socialLoginEnabled: PropTypes.bool,
  };

  state = {
    password: '',
    error: null,
    showResetPasswordModal: false,
    isLocked: false,
  };

  submitting = false;

  failed_attempts = 0;

  animationEventEmitter = new EventEmitter();

  passwordLoginAttemptTraceCtx = null;

  UNSAFE_componentWillMount() {
    const { isUnlocked, history, isSeedlessPasswordOutdated } = this.props;

    if (isUnlocked) {
      history.push(DEFAULT_ROUTE);
      return;
    }

    if (isSeedlessPasswordOutdated) {
      // first error if seedless password is outdated
      const { t } = this.context;
      this.setState({ error: t('passwordChangedRecently') });
    }
  }

  componentDidMount() {
    const { location } = this.props;
    const { onboardingTraceCtx } = location?.state ?? {};
    if (onboardingTraceCtx) {
      this.passwordLoginAttemptTraceCtx = bufferedTrace({
        name: TraceName.OnboardingPasswordLoginAttempt,
        op: TraceOperation.OnboardingUserJourney,
        parentContext: onboardingTraceCtx,
      });
    }
  }

  componentWillUnmount() {
    if (this.passwordLoginAttemptTraceCtx) {
      bufferedEndTrace({ name: TraceName.OnboardingPasswordLoginAttempt });
      this.passwordLoginAttemptTraceCtx = null;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !prevProps.isSeedlessPasswordOutdated &&
      prevProps.isSeedlessPasswordOutdated !==
        this.props.isSeedlessPasswordOutdated
    ) {
      this.setState({ error: this.context.t('passwordChangedRecently') });
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { password } = this.state;
    const { onSubmit } = this.props;

    if (password === '' || this.submitting) {
      return;
    }

    this.setState({ error: null });
    this.submitting = true;

    try {
      await onSubmit(password);
      this.context.trackEvent(
        {
          category: MetaMetricsEventCategory.Navigation,
          event: MetaMetricsEventName.AppUnlocked,
          properties: {
            failed_attempts: this.failed_attempts,
          },
        },
        {
          isNewVisit: true,
        },
      );
      bufferedEndTrace({ name: TraceName.OnboardingExistingSocialLogin });
      bufferedEndTrace({ name: TraceName.OnboardingJourneyOverall });
    } catch (error) {
      await this.handleLoginError(error);
    } finally {
      this.submitting = false;
    }
  };

  handleLoginError = async (error) => {
    const { t } = this.context;
    this.failed_attempts += 1;
    const { message, data } = error;
    let finalErrorMessage = message;
    let errorReason;
    let isLocked = false;

    switch (message) {
      case 'Incorrect password':
      case SeedlessOnboardingControllerError.IncorrectPassword:
        finalErrorMessage = t('unlockPageIncorrectPassword');
        errorReason = 'incorrect_password';
        break;
      case SeedlessOnboardingControllerError.TooManyLoginAttempts:
        isLocked = true;

        // TODO: check if we need to remove this
        if (data.isPermanent) {
          finalErrorMessage = t('unlockPageTooManyFailedAttemptsPermanent');
        } else {
          const initialRemainingTime = data.remainingTime;
          finalErrorMessage = t('unlockPageTooManyFailedAttempts', [
            <Counter
              key="unlockPageTooManyFailedAttempts"
              remainingTime={initialRemainingTime}
              unlock={() => this.setState({ isLocked: false, error: '' })}
            />,
          ]);
        }
        errorReason = 'too_many_login_attempts';
        break;
      case 'Seed phrase not found':
        this.props.history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
        return;
      default:
        finalErrorMessage = message;
        break;
    }

    if (errorReason) {
      await this.props.forceUpdateMetamaskState();
      this.context.trackEvent({
        category: MetaMetricsEventCategory.Navigation,
        event: MetaMetricsEventName.AppUnlockedFailed,
        properties: {
          reason: errorReason,
          failed_attempts: this.failed_attempts,
        },
      });
    }
    this.setState({ error: finalErrorMessage, isLocked });
  };

  handleInputChange(event) {
    const { target } = event;
    this.setState({ password: target.value, error: null });

    const element = target;
    const boundingRect = element.getBoundingClientRect();
    const coordinates = getCaretCoordinates(element, element.selectionEnd ?? 0);
    this.animationEventEmitter.emit('point', {
      x: boundingRect.left + coordinates.left - element.scrollLeft,
      y: boundingRect.top + coordinates.top - element.scrollTop,
    });
  }

  renderMascot = () => {
    if (isFlask()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="120" height="120" />
      );
    }
    if (isBeta()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="120" height="120" />
      );
    }
    return (
      <Mascot
        animationEventEmitter={this.animationEventEmitter}
        width="120"
        height="120"
      />
    );
  };

  renderHelpText = () => {
    const { error } = this.state;

    if (!error) {
      return null;
    }

    return (
      <Box
        className="unlock-page__help-text"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
      >
        {error && (
          <Text
            variant={TextVariant.bodySm}
            textAlign={TextAlign.Left}
            color={TextColor.errorDefault}
          >
            {error}
          </Text>
        )}
      </Box>
    );
  };

  onForgotPassword = () => {
    const { socialLoginEnabled } = this.props;
    if (socialLoginEnabled) {
      this.setState({ showResetPasswordModal: true });
    } else {
      this.props.onRestore();
    }
  };

  render() {
    const { password, error, isLocked, showResetPasswordModal } = this.state;
    const { t } = this.context;

    const needHelpText = t('needHelpLinkText');

    return (
      <div className="unlock-page__container">
        <div className="unlock-page" data-testid="unlock-page">
          <form className="unlock-page__form" onSubmit={this.handleSubmit}>
            <div className="unlock-page__content">
              {showResetPasswordModal && (
                <ResetPasswordModal
                  onClose={() =>
                    this.setState({ showResetPasswordModal: false })
                  }
                />
              )}
              <div className="unlock-page__mascot-container">
                {this.renderMascot()}
                {isBeta() ? (
                  <div className="unlock-page__mascot-container__beta">
                    {t('beta')}
                  </div>
                ) : null}
              </div>
              <Text
                data-testid="unlock-page-title"
                as="h1"
                variant={TextVariant.headingLg}
                marginTop={1}
                marginBottom={2}
                color={TextColor.textDefault}
              >
                {t('welcomeBack')}
              </Text>
              <FormTextField
                value={password}
                id="password"
                label={
                  <Box
                    display={Display.Flex}
                    width={BlockSize.Full}
                    justifyContent={JustifyContent.spaceBetween}
                    alignItems={AlignItems.center}
                    marginBottom={1}
                  >
                    <Text variant={TextVariant.bodyMdMedium}>
                      {t('password')}
                    </Text>
                  </Box>
                }
                placeholder={t('enterPassword')}
                size={FormTextFieldSize.Lg}
                inputProps={{
                  'data-testid': 'unlock-password',
                  type: InputType.Password,
                }}
                onChange={(event) => this.handleInputChange(event)}
                error={Boolean(error)}
                helpText={this.renderHelpText()}
                autoComplete="current-password"
                autoFocus
                disabled={isLocked}
                width={BlockSize.Full}
                textFieldProps={{
                  borderRadius: BorderRadius.LG,
                }}
              />
            </div>
            <div className="unlock-page__footer">
              <Box
                className="unlock-page__buttons"
                display={Display.Flex}
                flexDirection={FlexDirection.Column}
                width={BlockSize.Full}
                gap={4}
              >
                <Button
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Lg}
                  block
                  type="submit"
                  data-testid="unlock-submit"
                  disabled={!password || isLocked}
                  loading={this.submitting}
                >
                  {this.context.t('unlock')}
                </Button>
                <ButtonLink
                  data-testid="unlock-forgot-password-button"
                  key="import-account"
                  type="button"
                  onClick={() => this.onForgotPassword()}
                >
                  {t('forgotPassword')}
                </ButtonLink>
              </Box>
              <div className="unlock-page__support">
                {t('needHelp', [
                  <a
                    href={SUPPORT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    key="need-help-link"
                    onClick={() => {
                      this.context.trackEvent(
                        {
                          category: MetaMetricsEventCategory.Navigation,
                          event: MetaMetricsEventName.SupportLinkClicked,
                          properties: {
                            url: SUPPORT_LINK,
                          },
                        },
                        {
                          contextPropsIntoEventProperties: [
                            MetaMetricsContextProp.PageTitle,
                          ],
                        },
                      );
                    }}
                  >
                    {needHelpText}
                  </a>,
                ])}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
