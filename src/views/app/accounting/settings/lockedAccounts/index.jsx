import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from 'reactstrap';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData, IntlMessages } from '@Helpers/Utils';
import { PRIVILEGE_SCREEN } from './lockedAccountRules';

const Content = React.lazy(() => import('./Content'));

const canViewScreen = () => {
  try {
    return Boolean(getPrivilegeData(PRIVILEGE_SCREEN).active);
  } catch {
    return false;
  }
};

const LockedAccounts = (props) => {
  const dispatch = useDispatch();
  const canView = canViewScreen();

  useEffect(() => {
    dispatch(onTitleEdit("menu.lockedAccounts"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/accounting/settings/lockedAccounts`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      {canView
        ? <Content {...props} />
        : <Alert color="warning">{IntlMessages('page.lockedAccounts.notice.noAccess')}</Alert>}
    </Suspense>
  )
};

export default LockedAccounts;
