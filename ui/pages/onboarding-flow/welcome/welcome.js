import React, { useContext, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_IMPORT_WITH_SRP_ROUTE,
  ONBOARDING_ACCOUNT_EXIST,
  ONBOARDING_ACCOUNT_NOT_FOUND,
  ONBOARDING_UNLOCK_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getCurrentKeyring,
  getFirstTimeFlowType,
  getShowTermsOfUse,
} from '../../../selectors';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { setFirstTimeFlowType, startOAuthLogin } from '../../../store/actions';
import LoadingScreen from '../../../components/ui/loading-screen';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  bufferedTrace,
  bufferedEndTrace,
  TraceName,
  TraceOperation,
} from '../../../../shared/lib/trace';
import WelcomeLogin from './welcome-login';
import WelcomeBanner from './welcome-banner';
import { LOGIN_OPTION, LOGIN_TYPE } from './types';

const WelcomePageState = {
  Banner: 'Banner',
  Login: 'Login',
};

export default function OnboardingWelcome() {
  const dispatch = useDispatch();
  const history = useHistory();
  const currentKeyring = useSelector(getCurrentKeyring);
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const showTermsOfUse = useSelector(getShowTermsOfUse);
  const [newAccountCreationInProgress, setNewAccountCreationInProgress] =
    useState(false);

  // If the user has not agreed to the terms of use, we show the banner
  // Otherwise, we show the login page
  const [pageState, setPageState] = useState(
    showTermsOfUse ? WelcomePageState.Banner : WelcomePageState.Login,
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const onboardingTraceCtxRef = useRef(null);
  const socialLoginTraceCtxRef = useRef(null);

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

  useEffect(() => {
    onboardingTraceCtxRef.current = bufferedTrace({
      name: TraceName.OnboardingJourneyOverall,
      op: TraceOperation.OnboardingUserJourney,
    });
  }, []);

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
    bufferedTrace({
      name: TraceName.OnboardingNewSrpCreateWallet,
      op: TraceOperation.OnboardingUserJourney,
      parentContext: onboardingTraceCtxRef.current,
    });

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE, {
      onboardingTraceCtx: onboardingTraceCtxRef.current,
    });
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
    bufferedTrace({
      name: TraceName.OnboardingExistingSrpImport,
      op: TraceOperation.OnboardingUserJourney,
      parentContext: onboardingTraceCtxRef.current,
    });

    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    history.push(ONBOARDING_IMPORT_WITH_SRP_ROUTE, {
      onboardingTraceCtx: onboardingTraceCtxRef.current,
    });
    ///: END:ONLY_INCLUDE_IF
  };

  const onSocialLoginClick = async (socialConnectionType, loginOption) => {
    setIsLoggingIn(true);
    try {
      setNewAccountCreationInProgress(true);
      dispatch(setFirstTimeFlowType(FirstTimeFlowType.social));

      socialLoginTraceCtxRef.current = bufferedTrace({
        name: TraceName.OnboardingSocialLoginAttempt,
        op: TraceOperation.OnboardingUserJourney,
        tags: { provider: socialConnectionType },
        parentContext: onboardingTraceCtxRef.current,
      });

      const isNewUser = await dispatch(startOAuthLogin(socialConnectionType));

      if (socialLoginTraceCtxRef.current) {
        bufferedEndTrace({ name: TraceName.OnboardingSocialLoginAttempt });
        socialLoginTraceCtxRef.current = null;
      }

      // if user is not new user and login option is new, redirect to account exist page
      if (loginOption === 'new' && !isNewUser) {
        bufferedTrace({
          name: TraceName.OnboardingNewSocialAccountExists,
          op: TraceOperation.OnboardingUserJourney,
          parentContext: socialLoginTraceCtxRef.current,
        });
        history.push(ONBOARDING_ACCOUNT_EXIST, {
          onboardingTraceCtx: socialLoginTraceCtxRef.current,
        });
        return;
      } else if (loginOption === 'existing' && isNewUser) {
        bufferedTrace({
          name: TraceName.OnboardingExistingSocialAccountNotFound,
          op: TraceOperation.OnboardingUserJourney,
          parentContext: socialLoginTraceCtxRef.current,
        });
        // if user is new user and login option is existing, redirect to account not found page
        history.push(ONBOARDING_ACCOUNT_NOT_FOUND, {
          onboardingTraceCtx: socialLoginTraceCtxRef.current,
        });
        return;
      }

      if (!isNewUser) {
        bufferedTrace({
          name: TraceName.OnboardingExistingSocialLogin,
          op: TraceOperation.OnboardingUserJourney,
          parentContext: socialLoginTraceCtxRef.current,
        });
        // redirect to login page
        history.push(ONBOARDING_UNLOCK_ROUTE, {
          onboardingTraceCtx: socialLoginTraceCtxRef.current,
        });
        return;
      }

      trackEvent({
        category: MetaMetricsEventCategory.Onboarding,
        // TODO: add seedless onboarding event to MetaMetrics?
        event: MetaMetricsEventName.OnboardingWalletCreationStarted,
        properties: {
          account_type: 'metamask',
        },
      });

      bufferedTrace({
        name: TraceName.OnboardingNewSocialCreateWallet,
        op: TraceOperation.OnboardingUserJourney,
        parentContext: socialLoginTraceCtxRef.current,
      });

      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      history.push(ONBOARDING_CREATE_PASSWORD_ROUTE, {
        onboardingTraceCtx: onboardingTraceCtxRef.current,
      });
      ///: END:ONLY_INCLUDE_IF
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = (loginType, loginOption) => {
    if (loginType === LOGIN_TYPE.SRP) {
      if (loginOption === LOGIN_OPTION.NEW) {
        onCreateClick();
      } else {
        onImportClick();
      }
    } else {
      onSocialLoginClick(loginType, loginOption);
    }
  };

  useEffect(() => {
    const container = document.getElementById('app-content');
    if (container) {
      if (pageState === WelcomePageState.Banner) {
        container.classList.remove('app-content--welcome-login');
        container.classList.add('app-content--welcome-banner');
      } else {
        container.classList.remove('app-content--welcome-banner');
        container.classList.add('app-content--welcome-login');
      }
    }

    return () => {
      if (container) {
        container.classList.remove('app-content--welcome-banner');
        container.classList.remove('app-content--welcome-login');
      }
    };
  }, [pageState]);

  return (
    <>
      {pageState === WelcomePageState.Banner && (
        <WelcomeBanner onAccept={() => setPageState(WelcomePageState.Login)} />
      )}
      {pageState === WelcomePageState.Login && (
        <WelcomeLogin onLogin={handleLogin} />
      )}
      {isLoggingIn && <LoadingScreen />}
    </>
  );
}
