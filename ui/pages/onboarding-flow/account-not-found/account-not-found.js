import React from 'react';
import { useHistory } from 'react-router-dom';
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
import { ONBOARDING_CREATE_PASSWORD_ROUTE } from '../../../helpers/constants/routes';

export default function AccountNotFound() {
  const history = useHistory();
  const t = useI18nContext();
  // TODO: get account email from controllers
  const accountEmail = 'username@gmail.com';

  const onCreateOne = async () => {
    // TODO: process the creation of a new wallet using the social login
    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
  };
  return (
    <Box
      className="account-not-found"
      data-testid="account-not-found"
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
          {t('accountNotFoundTitle')}
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
          {t('accountNotFoundDescription', [accountEmail])}
        </Text>
      </Box>

      <Box
        className="account-not-found__actions"
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
          onClick={onCreateOne}
        >
          {t('accountNotFoundCreateOne')}
        </Button>
      </Box>
    </Box>
  );
}
