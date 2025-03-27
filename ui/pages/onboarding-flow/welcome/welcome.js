import EventEmitter from 'events';
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Mascot from '../../../components/ui/mascot';
import Button from '../../../components/ui/button';
import {
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
} from '../../../store/actions';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  ONBOARDING_METAMETRICS,
  ///: END:ONLY_INCLUDE_IF
  ONBOARDING_SECURE_YOUR_WALLET_ROUTE,
  ONBOARDING_COMPLETION_ROUTE,
} from '../../../helpers/constants/routes';
import { getFirstTimeFlowType, getCurrentKeyring } from '../../../selectors';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';
import { isFlask, isBeta } from '../../../helpers/utils/build-types';
import IconGoogle from '../../../components/ui/icon/icon-google';
import IconApple from '../../../components/ui/icon/icon-apple';

export default function OnboardingWelcome() {
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
    <div className="onboarding-welcome" data-testid="onboarding-welcome">
      {/* <div className="onboarding-welcome__logo">
        <MetaFoxLogo theme="light" />
      </div> */}
      <div className="onboarding-welcome__mascot">{renderMascot()}</div>

      <div className="onboarding-welcome__title">
        <Text
          variant={TextVariant.headingLg}
          as="h2"
          textAlign={TextAlign.Center}
          fontWeight={FontWeight.Bold}
        >
          {t('welcomeToMetaMask')}!
        </Text>
      </div>

      <ul className="onboarding-welcome__buttons">
        <li>
          <Button icon={<Icon name={IconName.Google} />} type="secondary">
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
              'Continue with Google'
              ///: END:ONLY_INCLUDE_IF
            }
          </Button>
        </li>
        <li>
          <Button icon={<Icon name={IconName.Apple} />} type="secondary">
            {
              ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
              'Continue with Apple'
              ///: END:ONLY_INCLUDE_IF
            }
          </Button>
        </li>
        <li>
          <div className="onboarding-welcome__or">
            <Text
              className="onboarding-welcome__or-text"
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
            type="primary"
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
            data-testid="onboarding-import-wallet"
            type="secondary"
            onClick={onImportClick}
          >
            {t('onboardingImportWallet')}
          </Button>
        </li>
      </ul>
    </div>
  );
}
