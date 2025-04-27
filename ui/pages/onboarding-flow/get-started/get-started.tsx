import EventEmitter from 'events';
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Mascot from '../../../components/ui/mascot';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Text,
} from '../../../components/component-library';
import {
  TextVariant,
  TextAlign,
  FontWeight,
  BlockSize,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { setFirstTimeFlowType } from '../../../store/actions';
import {
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
} from '../../../helpers/constants/routes';
import { getFirstTimeFlowType, getCurrentKeyring } from '../../../selectors';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';
import LoadingScreen from '../../../components/ui/loading-screen';
import LoginOptions from './login-options';
import { LOGIN_TYPE, LoginType } from './types';

export default function GetStarted() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [eventEmitter] = useState(new EventEmitter());
  const currentKeyring = useSelector(getCurrentKeyring);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const [loginOption, setLoginOption] = useState('');
  const [newAccountCreationInProgress, setNewAccountCreationInProgress] =
    useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  const onCreateClick = async () => {
    setIsLoggingIn(true);
    setNewAccountCreationInProgress(true);
    dispatch(setFirstTimeFlowType(FirstTimeFlowType.create));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletCreationStarted,
      properties: {
        account_type: 'metamask',
      },
    });

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
    ///: END:ONLY_INCLUDE_IF
  };

  const onImportClick = async () => {
    setIsLoggingIn(true);
    await dispatch(setFirstTimeFlowType(FirstTimeFlowType.import));
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletImportStarted,
      properties: {
        account_type: 'imported',
      },
    });

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_IMPORT_WITH_SRP_ROUTE);
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

  const handleLogin = (loginType: LoginType) => {
    if (loginType === LOGIN_TYPE.SRP) {
      if (loginOption === 'new') {
        onCreateClick();
      } else {
        onImportClick();
      }
    } else {
      // TODO: handle social login
      console.log('handleLogin', loginType);
    }
  };

  return (
    <div className="get-started" data-testid="get-started">
      <div className="get-started__content">
        <div className="get-started__mascot">{renderMascot()}</div>

        <div className="get-started__title">
          <Text
            variant={TextVariant.displayMd}
            as="h2"
            textAlign={TextAlign.Center}
            fontWeight={FontWeight.Bold}
            data-testid="onboarding-welcome"
          >
            {t('welcomeToMetaMask')}!
          </Text>
        </div>
      </div>

      <div className="get-started__footer">
        <ul className="get-started__buttons">
          <li>
            <Button
              data-testid="onboarding-create-wallet"
              variant={ButtonVariant.Primary}
              width={BlockSize.Full}
              size={ButtonSize.Lg}
              onClick={() => {
                setLoginOption('new');
              }}
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
              data-testid="onboarding-import-wallet"
              variant={ButtonVariant.Secondary}
              width={BlockSize.Full}
              size={ButtonSize.Lg}
              onClick={() => {
                setLoginOption('existing');
              }}
            >
              {t('onboardingImportWallet')}
            </Button>
          </li>
        </ul>
      </div>
      {loginOption && (
        <LoginOptions
          loginOption={loginOption}
          onClose={() => {
            setLoginOption('');
          }}
          handleLogin={handleLogin}
        />
      )}
      {isLoggingIn && <LoadingScreen />}
    </div>
  );
}
