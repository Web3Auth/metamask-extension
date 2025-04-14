import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { isValidMnemonic } from '@ethersproject/hdnode';
import {
  BlockSize,
  IconColor,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  ONBOARDING_CREATE_PASSWORD_ROUTE,
  ONBOARDING_GET_STARTED_ROUTE,
} from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SrpInputImport from '../../../components/app/srp-input-import';
import { getCurrentKeyring } from '../../../selectors';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  Text,
  Box,
  Button,
  IconName,
  ButtonIcon,
  ButtonIconSize,
  ButtonSize,
} from '../../../components/component-library';
import SRPDetailsModal from '../../../components/app/srp-details-modal';

const hasUpperCase = (draftSrp) => {
  return draftSrp !== draftSrp.toLowerCase();
};
export default function ImportSRP({ submitSecretRecoveryPhrase }) {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const [srpError, setSrpError] = useState('');
  const history = useHistory();
  const t = useI18nContext();
  const currentKeyring = useSelector(getCurrentKeyring);

  useEffect(() => {
    if (currentKeyring) {
      history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
    }
  }, [currentKeyring, history]);
  const trackEvent = useContext(MetaMetricsContext);

  const onContinue = () => {
    let newSrpError = '';
    if (
      hasUpperCase(secretRecoveryPhrase) ||
      !isValidMnemonic(secretRecoveryPhrase)
    ) {
      newSrpError = t('invalidSeedPhraseNotFound');
    }

    setSrpError(newSrpError);

    if (newSrpError) {
      return;
    }

    submitSecretRecoveryPhrase(secretRecoveryPhrase);
    trackEvent({
      category: MetaMetricsEventCategory.Onboarding,
      event: MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
    });
    history.push(ONBOARDING_CREATE_PASSWORD_ROUTE);
  };

  useEffect(() => {
    setSrpError('');
  }, [secretRecoveryPhrase]);

  return (
    <div className="import-srp" data-testid="import-srp">
      {showSrpDetailsModal && (
        <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
      )}
      {/* TODO: check fully if it should always go to get started page */}
      <Box marginBottom={4}>
        <ButtonIcon
          iconName={IconName.ArrowLeft}
          color={IconColor.iconDefault}
          size={ButtonIconSize.Md}
          data-testid="import-srp-back-button"
          onClick={() => history.push(ONBOARDING_GET_STARTED_ROUTE)}
        />
      </Box>
      <div className="import-srp__step">
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          {t('stepOf', [1, 2])}
        </Text>
      </div>
      <div className="import-srp__header">
        <Text variant={TextVariant.headingLg}>{t('importAWallet')}</Text>
      </div>
      <div className="import-srp__description">
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          {t('typeYourSRP')}
        </Text>
        <ButtonIcon
          iconName={IconName.Info}
          size={ButtonIconSize.Sm}
          color={IconColor.iconAlternative}
          onClick={() => setShowSrpDetailsModal(true)}
        />
      </div>
      <div className="import-srp__actions">
        <Box width={BlockSize.Full}>
          <form onSubmit={(e) => e.preventDefault()}>
            <SrpInputImport onChange={setSecretRecoveryPhrase} />
            {srpError && (
              <Box marginTop={2}>
                <Text
                  variant={TextVariant.bodySm}
                  color={TextColor.errorDefault}
                >
                  {srpError}
                </Text>
              </Box>
            )}
          </form>
        </Box>
        <Button
          width={BlockSize.Full}
          size={ButtonSize.Lg}
          className="import-srp__confirm-button"
          type="primary"
          data-testid="import-srp-confirm"
          onClick={onContinue}
          disabled={!secretRecoveryPhrase.trim()}
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}

ImportSRP.propTypes = {
  submitSecretRecoveryPhrase: PropTypes.func,
};
