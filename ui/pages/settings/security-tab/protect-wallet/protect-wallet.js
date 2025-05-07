import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import {
  getBackupState,
  getMetaMaskAccountBalances,
} from '../../../../selectors';
import { getAccountsByKeyringId } from '../../../../store/actions';

const ProtectWallet = () => {
  const backUps = useSelector(getBackupState);
  const accountsWithBalances = useSelector(getMetaMaskAccountBalances);
  const [backupsWithAccounts, setBackupsWithAccounts] = useState([]);

  useEffect(() => {
    (async () => {
      const _backupsWithAccounts = await Promise.all(
        backUps.map(async (backup) => getAccountsByKeyringId(backup.id)),
      );

      setBackupsWithAccounts(
        _backupsWithAccounts.map((accounts, index) => ({
          ...backUps[index],
          accounts,
        })),
      );
    })();
  }, [backUps, accountsWithBalances]);

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
      {backupsWithAccounts.map((backUp) => (
        <div className="protect-wallet__container" key={backUp.id}>
          <Box
            display={Display.Flex}
            flexDirection={FlexDirection.Column}
            padding={4}
          >
            <Box
              display={Display.Flex}
              justifyContent={JustifyContent.spaceBetween}
            >
              <Text variant={TextVariant.bodyMd}>
                Secret Recovery Phrase 1 {backUp.id}
              </Text>
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                gap={1}
              >
                <Icon
                  name={
                    backUp.hasBackup ? IconName.Confirmation : IconName.Warning
                  }
                  color={
                    backUp.hasBackup
                      ? IconColor.successDefault
                      : IconColor.warningDefault
                  }
                />
                <Text
                  variant={TextVariant.bodyMd}
                  color={
                    backUp.hasBackup
                      ? TextColor.successDefault
                      : TextColor.warningDefault
                  }
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
            {backUp.accounts?.map((account) => (
              <Box
                key={account}
                display={Display.Flex}
                justifyContent={JustifyContent.spaceBetween}
                alignItems={AlignItems.center}
              >
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  gap={2}
                >
                  <AvatarAccount
                    address={account}
                    size={AvatarAccountSize.Sm}
                  />
                  <Text variant={TextVariant.bodySmMedium}>Account 1</Text>
                  <Text
                    variant={TextVariant.bodySm}
                    color={TextColor.textAlternative}
                  >
                    {shortenAddress(normalizeSafeAddress(account))}
                  </Text>
                </Box>
                <Text variant={TextVariant.bodySm}>
                  ${' '}
                  {parseInt(
                    accountsWithBalances[account]?.balance || '0x0',
                    16,
                  )}
                </Text>
              </Box>
            ))}
          </Box>
        </div>
      ))}
    </div>
  );
};

export default ProtectWallet;
