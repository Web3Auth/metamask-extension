import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Display,
  IconColor,
  TextAlign,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  Box,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  ButtonSize,
  Checkbox,
  Button,
  ButtonVariant,
  Icon,
  IconSize,
  IconName,
} from '../../../components/component-library';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { setSeedPhraseBackedUp } from '../../../store/actions';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';

export default function SkipSRPBackup({ onClose }) {
  const [checked, setChecked] = useState(false);
  const t = useI18nContext();
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);
  const history = useHistory();
  return (
    <Modal
      isOpen
      onClose={onClose}
      className="skip-srp-backup-modal"
      data-testid="skip-srp-backup-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader onClose={onClose}>
          <Box textAlign={TextAlign.Center}>
            <Icon
              name={IconName.Danger}
              size={IconSize.Xl}
              className="skip-srp-backup-popover__icon"
              color={IconColor.errorDefault}
            />
            <Text
              variant={TextVariant.headingMd}
              textAlign={TextAlign.Center}
              marginTop={4}
            >
              {t('skipAccountSecurity')}
            </Text>
          </Box>
        </ModalHeader>
        <Box paddingLeft={4} paddingRight={4}>
          <Checkbox
            id="skip-srp-backup__checkbox"
            className="skip-srp-backup__checkbox"
            data-testid="skip-srp-backup-checkbox"
            isChecked={checked}
            onChange={() => {
              setChecked(!checked);
            }}
            label={
              <Text variant={TextVariant.bodySmMedium}>
                {t('skipAccountSecurityDetails')}
              </Text>
            }
          />
          <Box display={Display.Flex} marginTop={6} gap={4}>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Lg}
              onClick={() => {
                trackEvent({
                  category: MetaMetricsEventCategory.Onboarding,
                  event:
                    MetaMetricsEventName.OnboardingWalletSecuritySkipCanceled,
                });
                onClose();
              }}
              block
            >
              {t('skipAccountSecuritySecureNow')}
            </Button>
            <Button
              size={ButtonSize.Lg}
              onClick={async () => {
                await dispatch(setSeedPhraseBackedUp(false));
                trackEvent({
                  category: MetaMetricsEventCategory.Onboarding,
                  event:
                    MetaMetricsEventName.OnboardingWalletSecuritySkipConfirmed,
                });
                history.push(ONBOARDING_COMPLETION_ROUTE);
              }}
              block
            >
              {t('skipAccountSecuritySkip')}
            </Button>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
}

SkipSRPBackup.propTypes = {
  onClose: PropTypes.func.isRequired,
};
