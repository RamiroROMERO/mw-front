import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const Incomes = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "07.02.012";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.incomes"));
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/process/incomes`));
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
}

export default Incomes