import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeAdmin, getPrivilegeData } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);
const ResumePayroll = (props) => {
  const dispatch = useDispatch();

  // const PRIVILEGE_CODE = "07.02.001";
  const PRIVILEGE_CODE = "07.02.015";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  const adminControl = getPrivilegeAdmin();

  useEffect(() => {
    dispatch(onTitleEdit("menu.resumePayroll"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/process/resumePayroll`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl = {screenControl} adminControl={adminControl} {...props} />
    </Suspense>
  )
};

export default ResumePayroll;