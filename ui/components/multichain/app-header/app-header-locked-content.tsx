import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MetafoxLogo from '../../ui/metafox-logo';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import Dropdown from '../../ui/dropdown';
// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import locales from '../../../../app/_locales/index.json';
import { getCurrentLocale } from '../../../ducks/locale/locale';
import { updateCurrentLocale } from '../../../store/actions';

export const AppHeaderLockedContent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const currentLocale = useSelector(getCurrentLocale);
  const localeOptions = locales.map((locale) => {
    return {
      name: locale.name,
      value: locale.code,
    };
  });

  return (
    <>
      <MetafoxLogo
        unsetIconHeight
        onClick={async () => {
          history.push(DEFAULT_ROUTE);
        }}
      />
      <Dropdown
        data-testid="multichain-app-header-select-locale"
        className="multichain-app-header__contents__dropdown"
        options={localeOptions}
        selectedOption={currentLocale}
        onChange={async (newLocale) => dispatch(updateCurrentLocale(newLocale))}
      />
    </>
  );
};
