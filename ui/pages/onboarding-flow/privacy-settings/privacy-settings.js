import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { ButtonVariant } from '@metamask/snaps-sdk';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { addUrlProtocolPrefix } from '../../../../app/scripts/lib/util';

import {
  useEnableProfileSyncing,
  useDisableProfileSyncing,
} from '../../../hooks/identity/useProfileSyncing';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  COINGECKO_LINK,
  CRYPTOCOMPARE_LINK,
  PRIVACY_POLICY_LINK,
  TRANSACTION_SIMULATIONS_LEARN_MORE_LINK,
} from '../../../../shared/lib/ui-utils';

import {
  Box,
  Text,
  TextField,
  IconName,
  ButtonLink,
  AvatarNetwork,
  ButtonIcon,
  IconSize,
  Icon,
  ButtonIconSize,
  FormTextField,
} from '../../../components/component-library';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  Display,
  TextAlign,
  TextColor,
  TextVariant,
  IconColor,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BlockSize,
  BackgroundColor,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_COMPLETION_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  getPetnamesEnabled,
  getExternalServicesOnboardingToggleState,
} from '../../../selectors';
import { getNetworkConfigurationsByChainId } from '../../../../shared/modules/selectors/networks';
import {
  setIpfsGateway,
  setUseCurrencyRateCheck,
  setUseMultiAccountBalanceChecker,
  setUse4ByteResolution,
  setUseTokenDetection,
  setUseAddressBarEnsResolution,
  showModal,
  toggleNetworkMenu,
  setIncomingTransactionsPreferences,
  setUseTransactionSimulations,
  setPetnamesEnabled,
  setEditedNetwork,
} from '../../../store/actions';
import {
  onboardingToggleBasicFunctionalityOn,
  openBasicFunctionalityModal,
} from '../../../ducks/app/app';
import IncomingTransactionToggle from '../../../components/app/incoming-trasaction-toggle/incoming-transaction-toggle';
import {
  CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP,
  TEST_CHAINS,
} from '../../../../shared/constants/network';
import { selectIsProfileSyncingEnabled } from '../../../selectors/identity/profile-syncing';
import { Setting } from './setting';

const ANIMATION_TIME = 500;

export default function PrivacySettings() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  // TODO: set to false when we have the third party settings
  const [showDetail, setShowDetail] = useState(true);
  const [hiddenClass, setHiddenClass] = useState(true);

  const defaultState = useSelector((state) => state.metamask);
  const {
    incomingTransactionsPreferences,
    use4ByteResolution,
    useTokenDetection,
    useCurrencyRateCheck,
    useMultiAccountBalanceChecker,
    ipfsGateway,
    useAddressBarEnsResolution,
    useTransactionSimulations,
  } = defaultState;
  const petnamesEnabled = useSelector(getPetnamesEnabled);

  const [turnOn4ByteResolution, setTurnOn4ByteResolution] =
    useState(use4ByteResolution);
  const [turnOnTokenDetection, setTurnOnTokenDetection] =
    useState(useTokenDetection);
  const [turnOnCurrencyRateCheck, setTurnOnCurrencyRateCheck] =
    useState(useCurrencyRateCheck);

  const [
    isMultiAccountBalanceCheckerEnabled,
    setMultiAccountBalanceCheckerEnabled,
  ] = useState(useMultiAccountBalanceChecker);
  const [isTransactionSimulationsEnabled, setTransactionSimulationsEnabled] =
    useState(useTransactionSimulations);
  const [ipfsURL, setIPFSURL] = useState(ipfsGateway);
  const [ipfsError, setIPFSError] = useState(null);
  const [addressBarResolution, setAddressBarResolution] = useState(
    useAddressBarEnsResolution,
  );
  const [turnOnPetnames, setTurnOnPetnames] = useState(petnamesEnabled);

  const trackEvent = useContext(MetaMetricsContext);
  const networkConfigurations = useSelector(getNetworkConfigurationsByChainId);

  const externalServicesOnboardingToggleState = useSelector(
    getExternalServicesOnboardingToggleState,
  );

  const isProfileSyncingEnabled = useSelector(selectIsProfileSyncingEnabled);

  const { enableProfileSyncing, error: enableProfileSyncingError } =
    useEnableProfileSyncing();
  const { disableProfileSyncing, error: disableProfileSyncingError } =
    useDisableProfileSyncing();

  useEffect(() => {
    if (externalServicesOnboardingToggleState) {
      enableProfileSyncing();
    } else {
      disableProfileSyncing();
    }
  }, [
    externalServicesOnboardingToggleState,
    enableProfileSyncing,
    disableProfileSyncing,
  ]);

  const handleSubmit = () => {
    dispatch(setUse4ByteResolution(turnOn4ByteResolution));
    dispatch(setUseTokenDetection(turnOnTokenDetection));
    dispatch(
      setUseMultiAccountBalanceChecker(isMultiAccountBalanceCheckerEnabled),
    );
    dispatch(setUseCurrencyRateCheck(turnOnCurrencyRateCheck));
    dispatch(setUseAddressBarEnsResolution(addressBarResolution));
    setUseTransactionSimulations(isTransactionSimulationsEnabled);
    dispatch(setPetnamesEnabled(turnOnPetnames));

    // Profile Syncing Setup
    if (!externalServicesOnboardingToggleState) {
      disableProfileSyncing();
    }

    if (ipfsURL && !ipfsError) {
      const { host } = new URL(addUrlProtocolPrefix(ipfsURL));
      dispatch(setIpfsGateway(host));
    }

    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletAdvancedSettings,
      properties: {
        settings_group: 'onboarding_advanced_configuration',
        is_profile_syncing_enabled: isProfileSyncingEnabled,
        is_basic_functionality_enabled: externalServicesOnboardingToggleState,
        show_incoming_tx: incomingTransactionsPreferences,
        turnon_token_detection: turnOnTokenDetection,
      },
    });

    history.push(ONBOARDING_COMPLETION_ROUTE);
  };

  const handleProfileSyncToggleSetValue = async () => {
    if (isProfileSyncingEnabled) {
      dispatch(
        showModal({
          name: 'CONFIRM_TURN_OFF_PROFILE_SYNCING',
          turnOffProfileSyncing: () => {
            disableProfileSyncing();
          },
        }),
      );
    } else {
      enableProfileSyncing();
    }
  };

  const handleIPFSChange = (url) => {
    setIPFSURL(url);
    try {
      const { host } = new URL(addUrlProtocolPrefix(url));
      if (!host || host === 'gateway.ipfs.io') {
        throw new Error();
      }
      setIPFSError(null);
    } catch (error) {
      setIPFSError(t('onboardingAdvancedPrivacyIPFSInvalid'));
    }
  };

  const showThirdPartySettings = () => {
    setShowDetail(true);

    setTimeout(() => {
      setHiddenClass(false);
    }, ANIMATION_TIME);
  };

  const handleBack = () => {
    setShowDetail(false);
    setTimeout(() => {
      setHiddenClass(true);
    }, ANIMATION_TIME);
  };

  return (
    <>
      <div className="privacy-settings" data-testid="privacy-settings">
        <div
          className={classnames('container', {
            'show-detail': showDetail,
            'show-list': !showDetail,
          })}
        >
          <div className="list-view">
            <Box
              className="privacy-settings__header"
              marginTop={6}
              marginBottom={6}
              display={Display.Flex}
              flexDirection={FlexDirection.Column}
              justifyContent={JustifyContent.flexStart}
            >
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                flexDirection={FlexDirection.Row}
                justifyContent={JustifyContent.flexStart}
              >
                <ButtonIcon
                  iconName={IconName.ArrowLeft}
                  color={IconColor.iconDefault}
                  size={ButtonIconSize.Md}
                  data-testid="privacy-settings-back-button"
                  onClick={handleSubmit}
                />
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  justifyContent={JustifyContent.center}
                  width={BlockSize.Full}
                >
                  <Text variant={TextVariant.headingMd} as="h2">
                    Default Settings
                  </Text>
                </Box>
              </Box>
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.textAlternative}
                marginTop={5}
              >
                {t('defaultSettingsSubTitle')}&nbsp;
                <a
                  href="https://support.metamask.io/privacy-and-security/privacy-best-practices"
                  target="_blank"
                  rel="noreferrer"
                  key="learnMoreAboutPrivacy"
                >
                  {t('learnMoreAboutPrivacy')}
                </a>
              </Text>

              <Box>
                <Setting
                  dataTestId="basic-functionality-toggle"
                  value={externalServicesOnboardingToggleState}
                  setValue={(toggledValue) => {
                    if (toggledValue) {
                      dispatch(onboardingToggleBasicFunctionalityOn());
                      trackEvent({
                        category: MetaMetricsEventCategory.Onboarding,
                        event: MetaMetricsEventName.SettingsUpdated,
                        properties: {
                          settings_group: 'onboarding_advanced_configuration',
                          settings_type: 'basic_functionality',
                          old_value: false,
                          new_value: true,
                          was_profile_syncing_on: false,
                        },
                      });
                    } else {
                      dispatch(openBasicFunctionalityModal());
                    }
                  }}
                  title={t('basicConfigurationLabel')}
                  description={
                    <Text
                      variant={TextVariant.bodySm}
                      color={TextColor.textAlternative}
                    >
                      This includes basic features like token details and gas
                      settings. Keep this feature on for the best experience
                      while using MetaMask. Read our Privacy Policy to learn
                      more.
                    </Text>
                  }
                  tags={
                    <>
                      <Box
                        backgroundColor={BackgroundColor.successMuted}
                        className="privacy-settings__tag"
                      >
                        <Text
                          variant={TextVariant.bodyXsMedium}
                          color={TextColor.successDefault}
                        >
                          MetaMask API
                        </Text>
                      </Box>
                      <Box
                        backgroundColor={BackgroundColor.warningMuted}
                        className="privacy-settings__tag"
                      >
                        <Text
                          variant={TextVariant.bodyXsMedium}
                          color={TextColor.warningDefault}
                        >
                          IP Address
                        </Text>
                      </Box>
                    </>
                  }
                />

                <Setting
                  dataTestId="third-party-settings"
                  title="Third-party APIs"
                  className="categories-item"
                  showToggle={false}
                  description={
                    <Text
                      variant={TextVariant.bodySm}
                      color={TextColor.textAlternative}
                    >
                      If you don’t want to share your IP address or Ethereum
                      address with any third parties, you may want to turn off
                      features that use them. This will impact your MetaMask
                      experience.
                    </Text>
                  }
                  tags={
                    <>
                      <Box
                        backgroundColor={BackgroundColor.warningMuted}
                        className="privacy-settings__tag"
                      >
                        <Text
                          variant={TextVariant.bodyXsMedium}
                          color={TextColor.warningDefault}
                        >
                          Third party
                        </Text>
                      </Box>
                      <Box
                        backgroundColor={BackgroundColor.warningMuted}
                        className="privacy-settings__tag"
                      >
                        <Text
                          variant={TextVariant.bodyXsMedium}
                          color={TextColor.warningDefault}
                        >
                          IP Address
                        </Text>
                      </Box>
                      <Box
                        backgroundColor={BackgroundColor.warningMuted}
                        className="privacy-settings__tag"
                      >
                        <Text
                          variant={TextVariant.bodyXsMedium}
                          color={TextColor.warningDefault}
                        >
                          Account address
                        </Text>
                      </Box>
                    </>
                  }
                  onClick={showThirdPartySettings}
                />

                <Setting
                  dataTestId="profile-sync-toggle"
                  disabled={!externalServicesOnboardingToggleState}
                  value={isProfileSyncingEnabled}
                  setValue={handleProfileSyncToggleSetValue}
                  title={t('profileSync')}
                  description={
                    <>
                      <Text
                        variant={TextVariant.bodySm}
                        color={TextColor.textAlternative}
                        marginBottom={4}
                      >
                        Sync settings, messages, and more across MetaMask
                        Extension, Mobile, and Portfolio. You’ll need a unique
                        ID to use this feature, which will be created if you
                        allow data syncing. This makes it possible to sync your
                        data across platforms. We’ll use your Secret Recovery
                        Phrase to create this ID.
                      </Text>
                      <Text
                        variant={TextVariant.bodySm}
                        color={TextColor.textAlternative}
                      >
                        Notifications rely on this feature, and won&apos;t be
                        available when turned off.
                      </Text>
                    </>
                  }
                />

                <Setting
                  title={t('onboardingAdvancedPrivacyNetworkTitle')}
                  showToggle={false}
                  description={
                    <>
                      <Text
                        variant={TextVariant.bodySm}
                        color={TextColor.textAlternative}
                      >
                        {t('onboardingAdvancedPrivacyNetworkDescription', [
                          <a
                            href="https://consensys.io/privacy-policy/"
                            key="link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('privacyMsg')}
                          </a>,
                        ])}
                      </Text>

                      <Box paddingTop={4}>
                        <Box
                          display={Display.Flex}
                          flexDirection={FlexDirection.Column}
                          gap={5}
                        >
                          {Object.values(networkConfigurations)
                            .filter(
                              ({ chainId }) => !TEST_CHAINS.includes(chainId),
                            )
                            .map((network) => (
                              <Box
                                key={network.chainId}
                                className="privacy-settings__customizable-network"
                                onClick={() => {
                                  dispatch(
                                    setEditedNetwork({
                                      chainId: network.chainId,
                                    }),
                                  );
                                  dispatch(toggleNetworkMenu());
                                }}
                                display={Display.Flex}
                                alignItems={AlignItems.center}
                                justifyContent={JustifyContent.spaceBetween}
                              >
                                <Box
                                  display={Display.Flex}
                                  alignItems={AlignItems.center}
                                >
                                  <AvatarNetwork
                                    src={
                                      CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP[
                                        network.chainId
                                      ]
                                    }
                                  />
                                  <Box
                                    textAlign={TextAlign.Left}
                                    marginLeft={3}
                                  >
                                    <Text variant={TextVariant.bodySmMedium}>
                                      {network.name}
                                    </Text>
                                    <Text
                                      variant={TextVariant.bodyXs}
                                      color={TextColor.textAlternative}
                                    >
                                      {
                                        // Get just the protocol + domain, not the infura key in path
                                        new URL(
                                          network?.rpcEndpoints[
                                            network?.defaultRpcEndpointIndex
                                          ]?.url,
                                        )?.origin
                                      }
                                    </Text>
                                  </Box>
                                </Box>
                                <ButtonIcon
                                  iconName={IconName.ArrowRight}
                                  size={IconSize.Md}
                                />
                              </Box>
                            ))}
                          <ButtonLink
                            onClick={() => {
                              dispatch(
                                toggleNetworkMenu({
                                  isAddingNewNetwork: true,
                                }),
                              );
                            }}
                            justifyContent={JustifyContent.Left}
                            variant={ButtonVariant.link}
                          >
                            <Box
                              display={Display.Flex}
                              alignItems={AlignItems.center}
                            >
                              <Icon name={IconName.Add} marginRight={3} />
                              <Text color={TextColor.primaryDefault}>
                                {t('addANetwork')}
                              </Text>
                            </Box>
                          </ButtonLink>
                        </Box>
                      </Box>
                    </>
                  }
                />
              </Box>
            </Box>
          </div>

          <div
            className={classnames('detail-view', {
              hidden: !showDetail && hiddenClass,
            })}
          >
            <Box
              className="privacy-settings__header"
              marginTop={6}
              marginBottom={6}
              display={Display.Flex}
              flexDirection={FlexDirection.Column}
              justifyContent={JustifyContent.flexStart}
            >
              <Box
                display={Display.Flex}
                alignItems={AlignItems.center}
                flexDirection={FlexDirection.Row}
                justifyContent={JustifyContent.flexStart}
              >
                <ButtonIcon
                  data-testid="category-back-button"
                  iconName={IconName.ArrowLeft}
                  color={IconColor.iconDefault}
                  size={ButtonIconSize.Md}
                  onClick={handleBack}
                />
                <Box
                  display={Display.Flex}
                  alignItems={AlignItems.center}
                  justifyContent={JustifyContent.center}
                  width={BlockSize.Full}
                >
                  <Text variant={TextVariant.headingMd} as="h2">
                    Third-party APIs
                  </Text>
                </Box>
              </Box>
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.textAlternative}
                marginTop={5}
              >
                These settings use third-party APIs to work. If you don&apos;t
                want to share your IP address or Ethereum address with any third
                parties, you may want to turn off features that use them. This
                will impact your MetaMask experience.
              </Text>
            </Box>
            <Box>
              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                setValue={setMultiAccountBalanceCheckerEnabled}
                title={t('useMultiAccountBalanceChecker')}
                description={
                  <Text
                    variant={TextVariant.bodySm}
                    color={TextColor.textAlternative}
                  >
                    Get balance updates for all your accounts at once. It allows
                    for a faster and overall better experience for managing
                    multiple accounts. Turning off this feature means others are
                    less likely to associate one account with another.
                  </Text>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                  </>
                }
              />

              {/* TODO: No setValue yet */}
              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                title={t('showIncomingTransactions')}
                description={
                  <Text
                    variant={TextVariant.bodySm}
                    color={TextColor.textAlternative}
                  >
                    This relies on different third-party APIs for each network.
                  </Text>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        IP address
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Account address
                      </Text>
                    </Box>
                  </>
                }
              />

              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                title={t('useSafeChainsListValidation')}
                description={
                  <Text
                    variant={TextVariant.bodySm}
                    color={TextColor.textAlternative}
                  >
                    MetaMask uses chainid.network to show accurate and
                    standardized network details. This reduces your chances of
                    connecting to malicious or incorrect network.
                  </Text>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.successMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.successDefault}
                      >
                        Improves safety
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        IP address
                      </Text>
                    </Box>
                  </>
                }
              />

              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                title={t('ipfsGateway')}
                description={
                  <>
                    <Text
                      variant={TextVariant.bodySm}
                      color={TextColor.textAlternative}
                    >
                      MetaMask uses third-party services to show images of your
                      NFTs stored on IPFS, display information related to ENS
                      addresses entered in your browser's address bar, and fetch
                      icons for different tokens.
                    </Text>
                    <Box paddingTop={2}>
                      <FormTextField
                        id="ipfs-gateway"
                        label="Choose your preferred IPFS gateway"
                        value={ipfsURL}
                        style={{ width: '100%' }}
                        inputProps={{ 'data-testid': 'ipfs-input' }}
                        onChange={(e) => {
                          handleIPFSChange(e.target.value);
                        }}
                      />
                      {ipfsURL ? (
                        <Text
                          variant={TextVariant.bodySm}
                          color={
                            ipfsError
                              ? TextColor.errorDefault
                              : TextColor.successDefault
                          }
                        >
                          {ipfsError || t('onboardingAdvancedPrivacyIPFSValid')}
                        </Text>
                      ) : null}
                    </Box>
                  </>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        IP address
                      </Text>
                    </Box>
                  </>
                }
              />

              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                title={t('displayNftMedia')}
                description={
                  <>
                    <Text
                      variant={TextVariant.bodySm}
                      color={TextColor.textAlternative}
                    >
                      NFT autodetection relies on this feature.
                    </Text>
                  </>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        IP address
                      </Text>
                    </Box>
                  </>
                }
              />

              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                title={t('useNftDetection')}
                description={
                  <>
                    <Text
                      variant={TextVariant.bodySm}
                      color={TextColor.textAlternative}
                    >
                      Displays all NFTs including fake ones airdropped by
                      scammers.
                    </Text>
                  </>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        IP address
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Account address
                      </Text>
                    </Box>
                  </>
                }
              />

              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                title={t('externalNameSourcesSetting')}
                description={
                  <>
                    <Text
                      variant={TextVariant.bodySm}
                      color={TextColor.textAlternative}
                    >
                      We’ll fetch proposed nicknames for addresses you interact
                      with from third-party sources like Etherscan, Infura, and
                      Lens protocol.
                    </Text>
                  </>
                }
                tags={
                  <>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        Third party
                      </Text>
                    </Box>
                    <Box
                      backgroundColor={BackgroundColor.warningMuted}
                      className="privacy-settings__tag"
                    >
                      <Text
                        variant={TextVariant.bodyXsMedium}
                        color={TextColor.warningDefault}
                      >
                        IP address
                      </Text>
                    </Box>
                  </>
                }
              />
            </Box>
          </div>
        </div>
      </div>
    </>
  );
}
