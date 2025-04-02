import EventEmitter from 'events';
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Mascot from '../../../components/ui/mascot';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../components/component-library';
import {
  TextVariant,
  TextAlign,
  FontWeight,
  TextColor,
  BlockSize,
  IconColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  setFirstTimeFlowType,
  setTermsOfUseLastAgreed,
  startOAuthLogin,
} from '../../../store/actions';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  ONBOARDING_METAMETRICS,
  ///: END:ONLY_INCLUDE_IF
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
} from '../../../helpers/constants/routes';
import { getFirstTimeFlowType, getCurrentKeyring } from '../../../selectors';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';

export default function GetStarted() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [eventEmitter] = useState(new EventEmitter());
  const currentKeyring = useSelector(getCurrentKeyring);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const [newAccountCreationInProgress, setNewAccountCreationInProgress] =
    useState(false);

  // Don't allow users to come back to this screen after they
  // have already imported or created a wallet
  useEffect(() => {
    if (currentKeyring && !newAccountCreationInProgress) {
      if (firstTimeFlowType === FirstTimeFlowType.import) {
        history.replace(ONBOARDING_COMPLETION_ROUTE);
      }
      if (firstTimeFlowType === FirstTimeFlowType.restore) {
        history.replace(ONBOARDING_COMPLETION_ROUTE);
      } else {
        history.replace(ONBOARDING_SECURE_YOUR_WALLET_ROUTE);
      }
    }
  }, [
    currentKeyring,
    history,
    firstTimeFlowType,
    newAccountCreationInProgress,
  ]);
  const trackEvent = useContext(MetaMetricsContext);

  const onClickSocialLogin = async (provider) => {
    setNewAccountCreationInProgress(true);
    dispatch(setFirstTimeFlowType(FirstTimeFlowType.seedless));
    const isExistingUser = await dispatch(startOAuthLogin(provider));
    if (isExistingUser) {
      // redirect to login page
      history.push(ONBOARDING_UNLOCK_ROUTE);
      return;
    }

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      // TODO: add seedless onboarding event?
      event: MetaMetricsEventName.OnboardingWalletCreationStarted,
      properties: {
        account_type: 'metamask',
      },
    });
    dispatch(setTermsOfUseLastAgreed(new Date().getTime()));

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_METAMETRICS);
    ///: END:ONLY_INCLUDE_IF
  };

  const onCreateClick = async () => {
    setNewAccountCreationInProgress(true);
    dispatch(setFirstTimeFlowType(FirstTimeFlowType.create));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletCreationStarted,
      properties: {
        account_type: 'metamask',
      },
    });
    dispatch(setTermsOfUseLastAgreed(new Date().getTime()));

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_METAMETRICS);
    ///: END:ONLY_INCLUDE_IF
  };

  const onImportClick = async () => {
    await dispatch(setFirstTimeFlowType(FirstTimeFlowType.import));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletImportStarted,
      properties: {
        account_type: 'imported',
      },
    });
    dispatch(setTermsOfUseLastAgreed(new Date().getTime()));

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_METAMETRICS);
    ///: END:ONLY_INCLUDE_IF
  };

  const renderMascot = () => {
    if (isFlask()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="240" height="240" />
      );
    }
    if (isBeta()) {
      return (
        <img src="./images/logo/metamask-fox.svg" width="240" height="240" />
      );
    }
    return (
      <Mascot animationEventEmitter={eventEmitter} width="250" height="300" />
    );
  };

  return (
    <div className="get-started" data-testid="get-started">
      {/* <div className="get-started__logo">
        <MetaFoxLogo theme="light" />
      </div> */}
      <div className="get-started__mascot">{renderMascot()}</div>

      <div className="get-started__title">
        <Text
          variant={TextVariant.displayMd}
          as="h2"
          textAlign={TextAlign.Center}
          fontWeight={FontWeight.Bold}
        >
          {t('welcomeToMetaMask')}!
        </Text>
      </div>

      <ul className="get-started__buttons">
        <li>
          <button
            className="get-started__plain-button"
            onClick={() => onClickSocialLogin('google')}
          >
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
              <div className="get-started__plain-button-content">
                <img
                  src="images/icons/google.svg"
                  className="get-started__social-icon"
                  alt="Google icon"
                />
                <Text variant={TextVariant.bodyMd}>Continue with Google</Text>
              </div>
              ///: END:ONLY_INCLUDE_IF
            }
          </button>
        </li>
        <li>
          <button
            className="get-started__plain-button"
            onClick={() => onClickSocialLogin('apple')}
          >
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
              <div className="get-started__plain-button-content">
                <Icon
                  name={IconName.Apple}
                  color={IconColor.iconDefault}
                  size={IconSize.Lg}
                />
                <Text variant={TextVariant.bodyMd}>Continue with Apple</Text>
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
              OR
            </Text>
          </div>
        </li>
        <li>
          <Button
            data-testid="onboarding-create-wallet"
            variant={ButtonVariant.Primary}
            width={BlockSize.Full}
            size={ButtonSize.Lg}
            onClick={onCreateClick}
          >
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
              t('onboardingCreateWallet')
              ///: END:ONLY_INCLUDE_IF
            }
          </Button>
        </li>
        <li>
          <Button
            data-testid="onboarding-create-wallet"
            variant={ButtonVariant.Secondary}
            width={BlockSize.Full}
            size={ButtonSize.Lg}
            onClick={onImportClick}
          >
            {t('onboardingImportWallet')}
          </Button>
        </li>
      </ul>
    </div>
  );
}
