import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from 'reactstrap';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData, IntlMessages } from '@Helpers/Utils';
import { PRIVILEGE_SCREEN } from './depreciationApplyRules';

const Content = React.lazy(() =>
  import('./Content')
);

const canViewScreen = () => {
  try {
    return Boolean(getPrivilegeData(PRIVILEGE_SCREEN).active);
  } catch {
    return false;
  }
};

const DepreciationApply = (props) => {
  const dispatch = useDispatch();
  const canView = canViewScreen();
  const noAccessText = IntlMessages('page.depreciationApply.notice.noAccess'); // hook: siempre, no dentro del condicional

  useEffect(() => {
    dispatch(onTitleEdit("menu.depreciationApply"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/fixedAssets/process/depreciationApply`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      {canView
        ? <Content {...props} />
        : <Alert color="warning">{noAccessText}</Alert>}
    </Suspense>
  )
};
export default DepreciationApply;
