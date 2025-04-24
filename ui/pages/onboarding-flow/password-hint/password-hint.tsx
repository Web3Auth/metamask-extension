import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  BorderRadius,
  TextColor,
  IconColor,
} from '../../../helpers/constants/design-system';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  FormTextField,
  IconName,
  Text,
} from '../../../components/component-library';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { setPasswordHint } from '../../../store/actions';
import { setShowPasswordHintSavedToast } from '../../../components/app/toast-master/utils';
import { getPasswordHint } from '../../../selectors';

export default function PasswordHint() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isSamePasswordError, setIsSamePasswordError] = useState(false);
  const [hint, setHint] = useState(useSelector(getPasswordHint));
  // TODO: how to compare hint with current password?
  const currentPassword = null;

  const handleSubmitHint = () => {
    if (currentPassword === hint) {
      setIsSamePasswordError(true);
      return;
    }
    dispatch(setPasswordHint(hint));
    dispatch(setShowPasswordHintSavedToast(true));
    history.push(ONBOARDING_COMPLETION_ROUTE);
  };

  return (
    <Box className="password-hint" data-testid="password-hint">
      <div className="password-hint__content">
        <Box
          justifyContent={JustifyContent.flexStart}
          marginBottom={4}
          width={BlockSize.Full}
        >
          <ButtonIcon
            iconName={IconName.ArrowLeft}
            color={IconColor.iconDefault}
            size={ButtonIconSize.Md}
            data-testid="password-hint-back-button"
            onClick={() => history.goBack()}
            ariaLabel={t('back')}
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
            {t('passwordHintTitle')}
          </Text>
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
            marginBottom={6}
          >
            {t('passwordHintDescription')}
          </Text>
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
            marginBottom={6}
          >
            {t('passwordHintLeaveHint')}
          </Text>
          <FormTextField
            value={hint}
            placeholder="e.g. mom’s home"
            width={BlockSize.Full}
            borderRadius={BorderRadius.LG}
            error={isSamePasswordError}
            helpText={isSamePasswordError ? t('passwordHintError') : null}
            onChange={(e) => setHint(e.target.value)}
            onFocus={() => setIsSamePasswordError(false)}
          />
        </Box>
      </div>

      <Box
        className="password-hint__actions"
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
      >
        <Button
          data-testid="password-hint-save"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          width={BlockSize.Full}
          onClick={handleSubmitHint}
          disabled={isSamePasswordError || !hint}
        >
          {t('done')}
        </Button>
      </Box>
    </Box>
  );
}
