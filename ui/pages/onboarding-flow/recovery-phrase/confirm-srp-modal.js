import PropTypes from 'prop-types';
import React from 'react';
import {
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
  Button,
  ButtonVariant,
  Icon,
  IconSize,
  IconName,
} from '../../../components/component-library';

export default function ConfirmSrpModal({ onContinue, onClose, isError }) {
  const t = useI18nContext();

  const handleContinue = () => {
    onContinue();
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="srp-details-modal"
      data-testid="srp-details-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader onClose={onClose}>
          <Box textAlign={TextAlign.Center}>
            {/* TODO: Fix check icon */}
            <Icon
              name={isError ? IconName.CircleX : IconName.CircleCheck}
              size={IconSize.Xl}
              className="skip-srp-backup-popover__icon"
              color={
                isError ? IconColor.errorDefault : IconColor.successDefault
              }
            />
            <Text
              variant={TextVariant.headingMd}
              textAlign={TextAlign.Center}
              marginTop={4}
            >
              {isError
                ? t('confirmSrpErrorTitle')
                : t('confirmSrpSuccessTitle')}
            </Text>
          </Box>
        </ModalHeader>
        <Box paddingLeft={4} paddingRight={4}>
          <Text variant={TextVariant.bodyMd}>
            {isError
              ? t('confirmSrpErrorDescription')
              : t('confirmSrpSuccessDescription')}
          </Text>
          <Box marginTop={6}>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Lg}
              onClick={handleContinue}
              block
            >
              {isError ? t('tryAgain') : t('gotIt')}
            </Button>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
}

ConfirmSrpModal.propTypes = {
  onContinue: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isError: PropTypes.bool.isRequired,
};
