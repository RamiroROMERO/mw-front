import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeAdmin } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const ControlPermissions = (props) => {
  const dispatch = useDispatch();

  const adminControl = getPrivilegeAdmin();

  useEffect(() => {
    dispatch(onTitleEdit("menu.controlPermissions"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/controlPermissions`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content adminControl={adminControl} {...props} />
    </Suspense>
  )
}

export default ControlPermissions