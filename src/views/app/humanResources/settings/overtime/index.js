import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);
const Overtime = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "07.01.006";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.overtime"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/settings/overtime`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
};

export default Overtime;