import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  BlockSize,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { ONBOARDING_CREATE_PASSWORD_ROUTE } from '../../../helpers/constants/routes';
// import { useI18nContext } from '../../../hooks/useI18nContext';
import SrpInput from '../../../components/app/srp-input';
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
  Icon,
  IconName,
  IconSize,
} from '../../../components/component-library';
import Tooltip from '../../../components/ui/tooltip';

export default function ImportSRP({ submitSecretRecoveryPhrase }) {
  const [secretRecoveryPhrase, setSecretRecoveryPhrase] = useState('');
  const history = useHistory();
  // const t = useI18nContext();
  const currentKeyring = useSelector(getCurrentKeyring);

  useEffect(() => {
    if (currentKeyring) {
      history.replace(ONBOARDING_CREATE_PASSWORD_ROUTE);
    }
  }, [currentKeyring, history]);
  const trackEvent = useContext(MetaMetricsContext);

  return (
    <div className="import-srp" data-testid="import-srp">
      <div className="import-srp__step">
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          Step 1 of 2
        </Text>
      </div>
      <div className="import-srp__header">
        <Text variant={TextVariant.headingLg}>Import a wallet</Text>
      </div>
      <div className="import-srp__description">
        <Text variant={TextVariant.bodyMd} color={TextColor.textAlternative}>
          Enter your Secret Recovery Phrase
        </Text>
        <Tooltip position="top" title="Enter your Secret Recovery Phrase">
          <Icon
            name={IconName.Info}
            size={IconSize.Sm}
            color={TextColor.textAlternative}
          />
        </Tooltip>
      </div>
      <div className="import-srp__actions">
        <Box width={BlockSize.Full}>
          <SrpInput onChange={setSecretRecoveryPhrase} />
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
            });
            history.replace(ONBOARDING_CREATE_PASSWORD_ROUTE);
          }}
          disabled={!secretRecoveryPhrase.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

ImportSRP.propTypes = {
  submitSecretRecoveryPhrase: PropTypes.func,
};
