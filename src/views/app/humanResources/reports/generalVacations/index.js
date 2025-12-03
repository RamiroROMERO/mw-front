import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeAdmin } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const GeneralVacations = (props) => {
  const dispatch = useDispatch();

  const adminControl = getPrivilegeAdmin();

  useEffect(() => {
    dispatch(onTitleEdit("menu.generalVacations"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/generalVacations`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content adminControl={adminControl} {...props} />
    </Suspense>
  )
}

export default GeneralVacations