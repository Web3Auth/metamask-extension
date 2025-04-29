import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AuthConnection } from '@metamask/seedless-onboarding-controller';
import { capitalize } from 'lodash';
import {
  Box,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../../components/component-library';
import SRPQuizModal from '../../../../components/app/srp-quiz-modal/SRPQuiz';
import { SrpList } from '../../../../components/multichain/multi-srp/srp-list/srp-list';
import Card from '../../../../components/ui/card';
import {
  FlexDirection,
  JustifyContent,
  Display,
  AlignItems,
  BlockSize,
  TextVariant,
  TextColor,
  FontWeight,
  IconColor,
} from '../../../../helpers/constants/design-system';
import { getSocialLoginEmail } from '../../../../selectors/backup';
import { useI18nContext } from '../../../../hooks/useI18nContext';

export const RevealSrpList = () => {
  const t = useI18nContext();
  const [srpQuizModalVisible, setSrpQuizModalVisible] = useState(false);
  const [selectedKeyringId, setSelectedKeyringId] = useState('');

  const socialLoginEmail = useSelector(getSocialLoginEmail);
  const socialLoginEnabled = Boolean(socialLoginEmail);
  const socialLoginType = AuthConnection.Apple;

  const socialLoginCardTitle = () => {
    if (socialLoginEnabled) {
      return (
        <Box display={Display.Flex} alignItems={AlignItems.center} gap={2}>
          {socialLoginType === AuthConnection.Apple ? (
            <Icon
              name={IconName.Apple}
              color={IconColor.iconDefault}
              size={IconSize.Lg}
            />
          ) : (
            <img
              src={`images/icons/google.svg`}
              className="srp-reveal-list__social-icon"
              alt="Google icon"
            />
          )}
          <Text fontWeight={FontWeight.Medium}>
            {t('securitySocialLoginEnabled')}
          </Text>
        </Box>
      );
    }
    return (
      <Text fontWeight={FontWeight.Medium}>
        {t('securitySocialLoginDisabled')}
      </Text>
    );
  };

  return (
    <Box className="srp-reveal-list">
      <Box paddingTop={4} paddingLeft={4} paddingRight={4}>
        <Card
          className={
            socialLoginEnabled ? '' : 'srp-reveal-list__social-login-card'
          }
          onClick={() => {
            if (socialLoginEnabled) {
              return;
            }
            // TODO: Implement social login
            console.log('login with social');
          }}
        >
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Row}
            alignItems={AlignItems.center}
            justifyContent={JustifyContent.spaceBetween}
          >
            {socialLoginCardTitle()}
            {!socialLoginEnabled && (
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                gap={2}
              >
                <Text
                  fontWeight={FontWeight.Medium}
                  color={TextColor.errorDefault}
                >
                  {t('securitySocialLoginSetup')}
                </Text>
                <Icon name={IconName.ArrowRight} size={IconSize.Sm} />
              </Box>
            )}
          </Box>
          <Box>
            <Box
              width={BlockSize.Full}
              className="srp-reveal-list__divider"
              marginTop={2}
              marginBottom={2}
            />
            <Text
              variant={TextVariant.bodySm}
              color={TextColor.textAlternative}
            >
              {socialLoginEnabled
                ? t('securitySocialLoginEnabledDescription', [
                    capitalize(socialLoginType),
                  ])
                : t('securitySocialLoginDisabledDescription')}
            </Text>
          </Box>
        </Card>
      </Box>
      <SrpList
        onActionComplete={(keyringId) => {
          // TODO: if srp is not backed up do the secure srp flow else reveal the srp flow
          setSelectedKeyringId(keyringId);
          setSrpQuizModalVisible(true);
        }}
        hideShowAccounts={false}
      />
      {srpQuizModalVisible && selectedKeyringId && (
        <SRPQuizModal
          keyringId={selectedKeyringId}
          isOpen={srpQuizModalVisible}
          onClose={() => setSrpQuizModalVisible(false)}
        />
      )}
    </Box>
  );
};
