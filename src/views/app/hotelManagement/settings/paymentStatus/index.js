import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import { getPrivilegeData } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const PaymentStatus = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "07.01.002";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.paymentStatus"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/hotelManagement/settings/paymentStatus`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
}

export default PaymentStatus