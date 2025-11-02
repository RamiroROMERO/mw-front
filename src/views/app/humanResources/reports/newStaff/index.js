import React, { Suspense, useEffect } from 'react'
import { adminRoot } from '@Constants/defaultValues';
import { onBreadcrumbEdit, onTitleEdit } from '@Redux/actions';
import { useDispatch } from 'react-redux';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeAdmin } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const NewStaff = (props) => {
  const dispatch = useDispatch();

  const adminControl = getPrivilegeAdmin();

  useEffect(() => {
    dispatch(onTitleEdit("menu.newStaff"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/newStaff`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content adminControl={adminControl} {...props} />
    </Suspense>
  )
}

export default NewStaff