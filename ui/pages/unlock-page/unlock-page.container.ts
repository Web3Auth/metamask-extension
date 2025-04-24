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
} from '../../store/actions';
import { MetaMaskReduxDispatch, MetaMaskReduxState } from '../../store/store';
import UnlockPage from './unlock-page.component';

const mapStateToProps = (state: MetaMaskReduxState) => {
  const {
    metamask: { isUnlocked, preferences },
  } = state;
  const { passwordHint } = preferences;
  return {
    isUnlocked,
    passwordHint,
  };
};

const mapDispatchToProps = (dispatch: MetaMaskReduxDispatch) => {
  return {
    tryUnlockMetamask: (password: string) =>
      dispatch(tryUnlockMetamask(password)),
    markPasswordForgotten: () => dispatch(markPasswordForgotten()),
    forceUpdateMetamaskState: () => forceUpdateMetamaskState(dispatch),
  };
};

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>,
  ownProps: ReturnType<typeof withRouter>,
) => {
  const {
    markPasswordForgotten: propsMarkPasswordForgotten,
    tryUnlockMetamask: propsTryUnlockMetamask,
    ...restDispatchProps
  } = dispatchProps;
  const { history, onSubmit: ownPropsSubmit, ...restOwnProps } = ownProps;

  // TODO: might remove this once new forget password flow is implemented
  const onImport = async () => {
    await propsMarkPasswordForgotten();
    history.push(RESTORE_VAULT_ROUTE);
    if (getEnvironmentType() === ENVIRONMENT_TYPE_POPUP) {
      global.platform.openExtensionInBrowser?.(RESTORE_VAULT_ROUTE);
    }
  };

  const onSubmit = async (password: string) => {
    await propsTryUnlockMetamask(password);
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
