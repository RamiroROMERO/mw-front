import React, { Suspense, useEffect } from 'react'
import { onBreadcrumbEdit, onTitleEdit } from '@Redux/actions';
import { useDispatch } from 'react-redux';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeAdmin } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const Salaries = (props) => {
  const dispatch = useDispatch();

  const adminControl = getPrivilegeAdmin();

  useEffect(() => {
    dispatch(onTitleEdit("menu.salaries"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/salaries`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content adminControl={adminControl} {...props} />
    </Suspense>
  )
}

export default Salaries