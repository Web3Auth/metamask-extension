import { EventEmitter } from 'events';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  FormTextField,
  Box,
  ButtonLink,
  Button,
  ButtonSize,
  ButtonVariant,
  HelpText,
  HelpTextSeverity,
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
} from '../../helpers/constants/design-system';
import Mascot from '../../components/ui/mascot';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import {
  MetaMetricsContextProp,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../shared/constants/metametrics';
import { isFlask, isBeta } from '../../helpers/utils/build-types';
import { SUPPORT_LINK } from '../../../shared/lib/ui-utils';
import { getCaretCoordinates } from './unlock-page.util';

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
     * If isUnlocked is true will redirect to most recent route in history
     */
    isUnlocked: PropTypes.bool,
    /**
     * onClick handler for "Forgot password?" link
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
     * Password hint
     */
    passwordHint: PropTypes.string,
  };

  state = {
    password: '',
    error: null,
    showHint: false,
  };

  submitting = false;

  failed_attempts = 0;

  animationEventEmitter = new EventEmitter();

  UNSAFE_componentWillMount() {
    const { isUnlocked, history } = this.props;

    if (isUnlocked) {
      history.push(DEFAULT_ROUTE);
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { password } = this.state;
    const { onSubmit, forceUpdateMetamaskState } = this.props;

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
    } catch ({ message }) {
      this.failed_attempts += 1;

      if (message === 'Incorrect password') {
        await forceUpdateMetamaskState();
        this.context.trackEvent({
          category: MetaMetricsEventCategory.Navigation,
          event: MetaMetricsEventName.AppUnlockedFailed,
          properties: {
            reason: 'incorrect_password',
            failed_attempts: this.failed_attempts,
          },
        });
      }

      this.setState({ error: message });
      this.submitting = false;
    }
  };

  handleInputChange({ target }) {
    this.setState({ password: target.value, error: null });
    // tell mascot to look at page action
    if (target.getBoundingClientRect) {
      const element = target;
      const boundingRect = element.getBoundingClientRect();
      const coordinates = getCaretCoordinates(element, element.selectionEnd);
      this.animationEventEmitter.emit('point', {
        x: boundingRect.left + coordinates.left - element.scrollLeft,
        y: boundingRect.top + coordinates.top - element.scrollTop,
      });
    }
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
    const { error, showHint } = this.state;
    const { passwordHint } = this.props;
    if (showHint) {
      return (
        <HelpText color={TextColor.textMuted}>Hint: {passwordHint}</HelpText>
      );
    }
    if (error) {
      return <HelpText severity={HelpTextSeverity.Danger}>{error}</HelpText>;
    }
    return <HelpText color={TextColor.textMuted}>&nbsp;</HelpText>;
  };

  render() {
    const { password, error, showHint } = this.state;
    const { t } = this.context;
    const { onRestore } = this.props;

    const needHelpText = t('needHelpLinkText');

    return (
      <div className="unlock-page__container">
        <div className="unlock-page" data-testid="unlock-page">
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
            color={TextColor.textDefault}
          >
            {t('welcomeBack')}
          </Text>
          <form className="unlock-page__form" onSubmit={this.handleSubmit}>
            <FormTextField
              id="password"
              data-testid="unlock-password"
              label={
                <Box
                  display={Display.Flex}
                  width={BlockSize.Full}
                  justifyContent={JustifyContent.spaceBetween}
                  alignItems={AlignItems.center}
                >
                  <Text variant={TextVariant.bodyMdMedium}>
                    {t('password')}
                  </Text>
                  <ButtonLink
                    onClick={() => {
                      this.setState({ showHint: !showHint });
                    }}
                  >
                    {showHint ? 'Hide hint' : 'Show hint'}
                  </ButtonLink>
                </Box>
              }
              type="password"
              value={password}
              onChange={(event) => this.handleInputChange(event)}
              error={error}
              helpText={this.renderHelpText()}
              autoComplete="current-password"
              autoFocus
              width={BlockSize.Full}
              textFieldProps={{
                borderRadius: BorderRadius.LG,
              }}
            />
          </form>
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
              disabled={!this.state.password}
              onClick={this.handleSubmit}
            >
              {this.context.t('unlock')}
            </Button>
            <ButtonLink key="import-account" onClick={() => onRestore()}>
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
      </div>
    );
  }
}
