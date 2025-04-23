import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { CONSENSYS_PRIVACY_LINK } from '../../../../shared/lib/ui-utils';

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
import { getExternalServicesOnboardingToggleState } from '../../../selectors';
import {
  onboardingToggleBasicFunctionalityOn,
  openBasicFunctionalityModal,
} from '../../../ducks/app/app';
import { selectIsProfileSyncingEnabled } from '../../../selectors/identity/profile-syncing';
import { PRIVACY_TAGS } from '../../../helpers/constants/privacy-tags';
import { Setting } from './setting';

const ANIMATION_TIME = 500;

// TODO: Use the new UI for the privacy settings
export default function PrivacySettings() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  // TODO: set to false when we have the third party settings
  const [showDetail, setShowDetail] = useState(true);
  const [hiddenClass, setHiddenClass] = useState(true);

  const defaultState = useSelector((state) => state.metamask);
  const { incomingTransactionsPreferences, useMultiAccountBalanceChecker } =
    defaultState;

  const [
    isMultiAccountBalanceCheckerEnabled,
    setMultiAccountBalanceCheckerEnabled,
  ] = useState(useMultiAccountBalanceChecker);

  const trackEvent = useContext(MetaMetricsContext);

  const externalServicesOnboardingToggleState = useSelector(
    getExternalServicesOnboardingToggleState,
  );

  const isProfileSyncingEnabled = useSelector(selectIsProfileSyncingEnabled);

  const handleSubmit = () => {
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletAdvancedSettings,
      properties: {
        settings_group: 'onboarding_advanced_configuration',
        is_profile_syncing_enabled: isProfileSyncingEnabled,
        is_basic_functionality_enabled: externalServicesOnboardingToggleState,
        show_incoming_tx: incomingTransactionsPreferences,
      },
    });

    history.push(ONBOARDING_COMPLETION_ROUTE);
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
                  setValue={() => {
                    console.log('Profile sync toggle setValue');
                  }}
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
                value={false}
                setValue={() => {
                  console.log('Proposed nicknames toggle setValue');
                }}
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
