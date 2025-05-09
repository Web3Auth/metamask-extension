import PropTypes from 'prop-types';
import React from 'react';
import qrCode from 'qrcode-generator';
import {
  Display,
  FlexDirection,
  JustifyContent,
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
} from '../../component-library';

export default function DownloadMobileAppModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const t = useI18nContext();

  const qrImage = qrCode(4, 'M');
  qrImage.addData('https://metamask.io/download/');
  qrImage.make();

  return (
    <Modal
      isOpen
      onClose={onClose}
      className="download-mobile-app-modal"
      data-testid="download-mobile-app-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader onClose={onClose}>{t('downloadMetaMaskMobileTitle')}</ModalHeader>
        <Box
          paddingLeft={4}
          paddingRight={4}
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          gap={2}
        >
          <Text variant={TextVariant.bodyMd}>
            {t('downloadMetaMaskMobileDescription')}
          </Text>
          <Box display={Display.Flex} justifyContent={JustifyContent.center}>
            <Box className="download-mobile-app-modal__qr-code-wrapper">
              <Box
                data-testid="download-mobile-app-modal-qr-code-image"
                className="download-mobile-app-modal__qr-code-image"
                dangerouslySetInnerHTML={{
                  __html: qrImage.createTableTag(8, 20),
                }}
              />
              <Box className="download-mobile-app-modal__qr-code-logo">
                <img src="images/logo/metamask-fox.svg" alt="Logo" />
              </Box>
            </Box>
          </Box>
          <Text variant={TextVariant.bodyMd} textAlign={TextAlign.Center}>
            {t('downloadMetaMaskMobileQrNote')}
          </Text>
        </Box>
      </ModalContent>
    </Modal>
  );
}

DownloadMobileAppModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
