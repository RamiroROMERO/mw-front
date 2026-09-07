import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

const PRIVILEGE_CODE = "01.03.041";

const PointSales = (props) => {
  const dispatch = useDispatch();
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.pointSales"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/pointSales`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} screenControl={screenControl} />
    </Suspense>
  )
};

export default PointSales;