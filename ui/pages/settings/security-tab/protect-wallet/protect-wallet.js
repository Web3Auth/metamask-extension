import React from 'react';
import {
  AvatarAccount,
  AvatarAccountSize,
  Box,
  ButtonIcon,
  ButtonIconSize,
  Icon,
  IconName,
  Text,
} from '../../../../components/component-library';
import {
  AlignItems,
  Display,
  FlexDirection,
  IconColor,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { shortenAddress } from '../../../../helpers/utils/util';
// eslint-disable-next-line import/no-restricted-paths
import { normalizeSafeAddress } from '../../../../../app/scripts/lib/multichain/address';

const ProtectWallet = () => {
  const account1Address = '0x5CfE73b6021E818B776b421B1c4Db2474086a7e1';
  const shortenedAccount1Address = shortenAddress(
    normalizeSafeAddress(account1Address),
  );
  const account2Address = '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe6';
  const shortenedAccount2Address = shortenAddress(
    normalizeSafeAddress(account2Address),
  );

  return (
    <div className="protect-wallet">
      <div className="protect-wallet__container">
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          padding={4}
        >
          <Box
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
          >
            <Text variant={TextVariant.bodyMd}>Login with Apple or Google</Text>
            <Box display={Display.Flex} alignItems={AlignItems.center} gap={1}>
              <Icon
                name={IconName.Confirmation}
                color={IconColor.successDefault}
              />
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.successDefault}
              >
                All set
              </Text>
            </Box>
          </Box>
          <Box>
            <Text
              variant={TextVariant.bodySm}
              color={TextColor.textAlternative}
            >
              Your password is required to log in with Apple/Google.
            </Text>
          </Box>
        </Box>
      </div>
      <div className="protect-wallet__container">
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
          padding={4}
        >
          <Box
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
          >
            <Text variant={TextVariant.bodyMd}>Secret Recovery Phrase 1</Text>
            <Box display={Display.Flex} alignItems={AlignItems.center} gap={1}>
              <Icon name={IconName.Warning} color={IconColor.warningDefault} />
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.warningDefault}
              >
                Back up
              </Text>
              <Box>
                <ButtonIcon
                  iconName={IconName.ArrowRight}
                  size={ButtonIconSize.Sm}
                  color={IconColor.iconAlternative}
                  ariaLabel="Back up"
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          className="protect-wallet__container-body"
          padding={4}
          gap={2}
          display={Display.Flex}
          flexDirection={FlexDirection.Column}
        >
          <Box
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
            alignItems={AlignItems.center}
          >
            <Box display={Display.Flex} alignItems={AlignItems.center} gap={2}>
              <AvatarAccount
                address={account1Address}
                size={AvatarAccountSize.Sm}
              />
              <Text variant={TextVariant.bodySmMedium}>Account 1</Text>
              <Text
                variant={TextVariant.bodySm}
                color={TextColor.textAlternative}
              >
                {shortenedAccount1Address}
              </Text>
            </Box>
            <Text variant={TextVariant.bodySm}>$1,841.09</Text>
          </Box>
          <Box
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
            alignItems={AlignItems.center}
          >
            <Box display={Display.Flex} alignItems={AlignItems.center} gap={2}>
              <AvatarAccount
                address={account2Address}
                size={AvatarAccountSize.Sm}
              />
              <Text variant={TextVariant.bodySmMedium}>Solana Account 1</Text>
              <Text
                variant={TextVariant.bodySm}
                color={TextColor.textAlternative}
              >
                {shortenedAccount2Address}
              </Text>
            </Box>
            <Text variant={TextVariant.bodySm}>$45.29</Text>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default ProtectWallet;
