import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  FormTextField,
  FormTextFieldSize,
  Text,
} from '../../../../components/component-library';
import {
  BlockSize,
  BorderRadius,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { getPasswordHint } from '../../../../selectors';
import { setPasswordHint, verifyPassword } from '../../../../store/actions';

const PasswordHint = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [isSamePasswordError, setIsSamePasswordError] = useState(false);
  const [hint, setHint] = useState(useSelector(getPasswordHint));

  const handlePasswordHintOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const _hint = e.target.value;
    setHint(_hint);
  };

  // validate hint
  // check if the hint is not the same as the password
  const isValidPasswordHint = async () => {
    try {
      // checking if the hint is not the same as the password
      // by submitting the hint to the verifyPassword function
      await verifyPassword(hint);
      return false;
    } catch {
      // if the hint is not the same as the password, the verifyPassword function will throw an error
      return true;
    }
  };

  const handleSubmitHint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = await isValidPasswordHint();

    if (isValid) {
      dispatch(setPasswordHint(hint));
    } else {
      setIsSamePasswordError(true);
    }
  };

  return (
    <div className="settings-password-hint">
      <form
        className="settings-password-hint__form"
        onSubmit={handleSubmitHint}
      >
        <div className="settings-password-hint__content">
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
            marginBottom={4}
          >
            {t('passwordHintDescription')}
          </Text>

          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
            marginBottom={4}
          >
            {t('passwordHintLeaveHint')}
          </Text>

          <FormTextField
            value={hint}
            placeholder="e.g. mom’s home"
            size={FormTextFieldSize.Lg}
            width={BlockSize.Full}
            borderRadius={BorderRadius.LG}
            error={isSamePasswordError}
            helpText={isSamePasswordError ? t('passwordHintError') : null}
            onChange={handlePasswordHintOnChange}
            onFocus={() => setIsSamePasswordError(false)}
            marginBottom={4}
          />
        </div>
        <Button
          data-testid="password-hint-save"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Lg}
          width={BlockSize.Full}
          disabled={isSamePasswordError || !hint}
        >
          {t('save')}
        </Button>
      </form>
    </div>
  );
};

export default PasswordHint;
