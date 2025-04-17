import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/component-library/button';
import {
  TextVariant,
  Display,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BlockSize,
  IconColor,
} from '../../../helpers/constants/design-system';
import {
  Box,
  Text,
  IconName,
  ButtonIcon,
  ButtonIconSize,
} from '../../../components/component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  ONBOARDING_WELCOME_ROUTE,
  ONBOARDING_UNLOCK_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getFirstTimeFlowType,
  getUserSocialLoginEmail,
} from '../../../selectors';
import { FirstTimeFlowType } from '../../../../shared/constants/onboarding';

export default function AccountExist() {
  const history = useHistory();
  const t = useI18nContext();
  const firstTimeFlowType = useSelector(getFirstTimeFlowType);
  const userSocialLoginEmail = useSelector(getUserSocialLoginEmail);

  const onDone = async () => {
    history.push(ONBOARDING_UNLOCK_ROUTE);
  };

  useEffect(() => {
    // if the onboarding flow is not seedless, redirect to the welcome page
    if (firstTimeFlowType !== FirstTimeFlowType.seedless) {
      history.push(ONBOARDING_WELCOME_ROUTE);
    }
  }, [firstTimeFlowType, history]);

  return (
    <Box
      className="account-exist"
      data-testid="account-exist"
      display={Display.Flex}
      flexDirection={FlexDirection.Column}
    >
      <Box
        justifyContent={JustifyContent.flexStart}
        marginBottom={4}
        width={BlockSize.Full}
      >
        <ButtonIcon
          iconName={IconName.ArrowLeft}
          color={IconColor.iconDefault}
          size={ButtonIconSize.Md}
          data-testid="create-password-back-button"
          onClick={() => history.goBack()}
        />
      </Box>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.flexStart}
      >
        <Text
          variant={TextVariant.headingLg}
          as="h2"
          justifyContent={JustifyContent.center}
          style={{
            alignSelf: AlignItems.flexStart,
          }}
          marginBottom={4}
        >
          {t('accountAlreadyExistsTitle')}
        </Text>
        <Box
          width={BlockSize.Full}
          display={Display.Flex}
          justifyContent={JustifyContent.center}
          alignItems={AlignItems.center}
          marginBottom={6}
        >
          <img
            src="images/wallet-ready.svg"
            width={276}
            height={276}
            alt="Account already exists"
          />
        </Box>
        <Text variant={TextVariant.bodyMd} marginBottom={6}>
          {t('accountAlreadyExistsLoginDescription', [userSocialLoginEmail])}
        </Text>
      </Box>

      <Box
        className="account-exist__actions"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
      >
        <Button
          data-testid="onboarding-complete-done"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          width={BlockSize.Full}
          onClick={onDone}
        >
          {t('accountAlreadyExistsLogin')}
        </Button>
      </Box>
    </Box>
  );
}
