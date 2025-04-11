import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
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
  CONSENSYS_PRIVACY_LINK,
  CRYPTOCOMPARE_LINK,
  PRIVACY_POLICY_LINK,
  TRANSACTION_SIMULATIONS_LEARN_MORE_LINK,
} from '../../../../shared/lib/ui-utils';

import {
  Box,
  Text,
  IconName,
  ButtonIcon,
  ButtonIconSize,
} from '../../../components/component-library';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  Display,
  TextColor,
  TextVariant,
  IconColor,
  AlignItems,
  JustifyContent,
  FlexDirection,
  BlockSize,
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
import { PRIVACY_TAGS } from '../../../helpers/constants/privacy-tags';
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
                    {t('defaultSettingsTitle')}
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

              {/* Settings */}
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
                  descriptions={[
                    t('defaultSettingsBasicFunctionalityDescription', [
                      <a
                        href={CONSENSYS_PRIVACY_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        key="metametrics-consensys-privacy-link"
                      >
                        {t('privacyMsg')}
                      </a>,
                    ]),
                  ]}
                  tags={[PRIVACY_TAGS.METAMASK_API, PRIVACY_TAGS.IP_ADDRESS]}
                />

                <Setting
                  dataTestId="third-party-settings"
                  title={t('defaultSettingsThirdPartyAPITitle')}
                  showToggle={false}
                  descriptions={[t('defaultSettingsThirdPartyAPIDescription')]}
                  tags={[
                    PRIVACY_TAGS.THIRD_PARTY,
                    PRIVACY_TAGS.IP_ADDRESS,
                    PRIVACY_TAGS.ACCOUNT_ADDRESS,
                  ]}
                  onClick={showThirdPartySettings}
                />

                <Setting
                  dataTestId="profile-sync-toggle"
                  disabled={!externalServicesOnboardingToggleState}
                  value={isProfileSyncingEnabled}
                  setValue={handleProfileSyncToggleSetValue}
                  title={t('defaultSettingsProfileSyncTitle')}
                  descriptions={[
                    t('defaultSettingsProfileSyncDescription1'),
                    t('defaultSettingsProfileSyncDescription2'),
                  ]}
                />

                {/* TODO: Check toggle, how network selector works, and add network option*/}
                <Setting
                  title={t('onboardingAdvancedPrivacyNetworkTitle')}
                  setValue={() => {
                    console.log('Choose network setValue');
                  }}
                  descriptions={[
                    t('onboardingAdvancedPrivacyNetworkDescription', [
                      <a
                        href="https://consensys.io/privacy-policy/"
                        key="link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('privacyMsg')}
                      </a>,
                    ]),
                  ]}
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
                    {t('thirdPartyAPISettingsTitle')}
                  </Text>
                </Box>
              </Box>
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.textAlternative}
                marginTop={5}
              >
                {t('thirdPartyAPISettingsDescription')}
              </Text>
            </Box>
            <Box>
              <Setting
                value={isMultiAccountBalanceCheckerEnabled}
                setValue={setMultiAccountBalanceCheckerEnabled}
                title={t('thirdPartyAPIBatchAccountBalanceTitle')}
                descriptions={[
                  t('thirdPartyAPIBatchAccountBalanceDescription'),
                ]}
                tags={[PRIVACY_TAGS.THIRD_PARTY]}
              />

              {/* TODO:
               * Previous implementation handles this per network
               * ui/components/app/incoming-trasaction-toggle/incoming-transaction-toggle.tsx */}
              <Setting
                title={t('thirdPartyAPIshowIncomingTransactionsTitle')}
                descriptions={[
                  t('thirdPartyAPIshowIncomingTransactionsDescription'),
                ]}
                tags={[
                  PRIVACY_TAGS.THIRD_PARTY,
                  PRIVACY_TAGS.IP_ADDRESS,
                  PRIVACY_TAGS.ACCOUNT_ADDRESS,
                ]}
              />

              {/* TODO:
               * Network details check
               * Add safe chains list validation toggle
               * ui/pages/settings/security-tab/security-tab.component.js
               */}
              <Setting
                title={t('thirdPartyAPINetworkDetailsCheckTitle')}
                descriptions={[
                  t('thirdPartyAPINetworkDetailsCheckDescription'),
                ]}
                tags={[
                  PRIVACY_TAGS.IMPROVES_SAFETY,
                  PRIVACY_TAGS.THIRD_PARTY,
                  PRIVACY_TAGS.IP_ADDRESS,
                ]}
              />

              {/* TODO:
               * IPFS gateway
               * Add IPFS gateway toggle
               * ui/pages/settings/security-tab/security-tab.component.js
               */}
              <Setting
                title={t('thirdPartyAPIIPFSGatewayTitle')}
                descriptions={[t('thirdPartyAPIIPFSGatewayDescription')]}
                tags={[PRIVACY_TAGS.THIRD_PARTY, PRIVACY_TAGS.IP_ADDRESS]}
              />

              <div className="privacy-settings__group-settings">
                {/* TODO:
                 * Display NFT media
                 * Add Display NFT media toggle
                 */}
                <Setting
                  title={t('thirdPartyDisplayNftMediaTitle')}
                  descriptions={[t('thirdPartyDisplayNftMediaDescription')]}
                  tags={[PRIVACY_TAGS.THIRD_PARTY, PRIVACY_TAGS.IP_ADDRESS]}
                />

                {/* TODO:
                 * Autodetect NFTs
                 * Add Autodetect NFTs toggle
                 */}
                <Setting
                  title={t('thirdPartyAPINftDetectionTitle')}
                  descriptions={[t('thirdPartyAPINftDetectionDescription')]}
                  tags={[
                    PRIVACY_TAGS.THIRD_PARTY,
                    PRIVACY_TAGS.IP_ADDRESS,
                    PRIVACY_TAGS.ACCOUNT_ADDRESS,
                  ]}
                />
              </div>

              {/* TODO:
               * Proposed nicknames
               * Add Proposed nicknames toggle
               * check with petnamesEnabledToggle
               */}
              <Setting
                value={turnOnPetnames}
                setValue={setTurnOnPetnames}
                title={t('thirdPartyProposedNicknamesTitle')}
                descriptions={[t('thirdPartyProposedNicknamesDescription')]}
                tags={[PRIVACY_TAGS.THIRD_PARTY, PRIVACY_TAGS.IP_ADDRESS]}
              />
            </Box>
          </div>
        </div>
      </div>
    </>
  );
}
