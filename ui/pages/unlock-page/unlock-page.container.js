import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_POPUP } from '../../../shared/constants/app';
import {
  DEFAULT_ROUTE,
  RESTORE_VAULT_ROUTE,
} from '../../helpers/constants/routes';
import {
  tryUnlockMetamask,
  markPasswordForgotten,
  forceUpdateMetamaskState,
  tryRestoreAndUnlockMetamask,
} from '../../store/actions';
import { FirstTimeFlowType } from '../../../shared/constants/onboarding';
import UnlockPage from './unlock-page.component';

const mapStateToProps = (state) => {
  const {
    metamask: { isUnlocked, preferences, firstTimeFlow },
  } = state;
  const { passwordHint } = preferences;
  return {
    isUnlocked,
    passwordHint,
    firstTimeFlow,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tryUnlockMetamask: (password) => dispatch(tryUnlockMetamask(password)),
    tryRestoreAndUnlockMetamask: (password) =>
      dispatch(tryRestoreAndUnlockMetamask(password)),
    markPasswordForgotten: () => dispatch(markPasswordForgotten()),
    forceUpdateMetamaskState: () => forceUpdateMetamaskState(dispatch),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    // eslint-disable-next-line no-shadow
    markPasswordForgotten,
    // eslint-disable-next-line no-shadow
    tryUnlockMetamask,
    ...restDispatchProps
  } = dispatchProps;
  const { history, onSubmit: ownPropsSubmit, ...restOwnProps } = ownProps;

  // TODO: might remove this once new forget password flow is implemented
  const onImport = async () => {
    await markPasswordForgotten();
    history.push(RESTORE_VAULT_ROUTE);

    if (getEnvironmentType() === ENVIRONMENT_TYPE_POPUP) {
      global.platform.openExtensionInBrowser(RESTORE_VAULT_ROUTE);
    }
  };

  const onSubmit = async (password) => {
    const isSeedlessFlow =
      stateProps.firstTimeFlow === FirstTimeFlowType.seedless;
    if (isSeedlessFlow) {
      await tryRestoreAndUnlockMetamask(password);
    } else {
      await tryUnlockMetamask(password);
    }

    history.push(DEFAULT_ROUTE);
  };

  return {
    ...stateProps,
    ...restDispatchProps,
    ...restOwnProps,
    onRestore: onImport,
    onSubmit: ownPropsSubmit || onSubmit,
    history,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
)(UnlockPage);
