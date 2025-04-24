import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  BlockSize,
  IconColor,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_CREATE_PASSWORD_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SrpInputImport from '../../../components/app/srp-input-import';
import { getCurrentKeyring } from '../../../selectors';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { getHDEntropyIndex } from '../../../selectors/selectors';
import {
  Text,
  Box,
  Button,
  IconName,
  ButtonIcon,
  ButtonIconSize,
} from '../../../components/component-library';
import SRPDetailsModal from '../../../components/app/srp-details-modal';

export default function ImportSRP({ submitSecretRecoveryPhrase }) {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const [showSrpDetailsModal, setShowSrpDetailsModal] = useState(false);
  const history = useHistory();
  const hdEntropyIndex = useSelector(getHDEntropyIndex);
  const t = useI18nContext();
  const currentKeyring = useSelector(getCurrentKeyring);

  useEffect(() => {
    if (currentKeyring) {
      history.replace(ONBOARDING_CREATE_PASSWORD_ROUTE);
    }
  }, [currentKeyring, history]);
  const trackEvent = useContext(MetaMetricsContext);

  return (
    <div className="import-srp" data-testid="import-srp">
      {showSrpDetailsModal && (
        <SRPDetailsModal onClose={() => setShowSrpDetailsModal(false)} />
      )}
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
          <SrpInputImport onChange={setSecretRecoveryPhrase} />
        </Box>
        <Button
          width={BlockSize.Full}
          className="import-srp__confirm-button"
          type="primary"
          data-testid="import-srp-confirm"
          large
          onClick={() => {
            submitSecretRecoveryPhrase(secretRecoveryPhrase);
            trackEvent({
              category: MetaMetricsEventCategory.Onboarding,
              event:
                MetaMetricsEventName.OnboardingWalletSecurityPhraseConfirmed,
              properties: {
                hd_entropy_index: hdEntropyIndex,
              },
            });
            history.replace(ONBOARDING_CREATE_PASSWORD_ROUTE);
          }}
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
