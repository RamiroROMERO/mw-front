import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

// Privilegio de la pantalla (menu.prg: validUser('01.02.004')). Eliminar exige además 99.20.004 (anular documentos, el mismo que verificaba fnVerificarV2("99.20.004") en
// fac_purchase_orders.sc2): el back valida los dos.
const PRIVILEGE_CODE = "01.02.004";
const PRIVILEGE_DELETE = "99.20.004";

const Format = (props) => {
  const dispatch = useDispatch();
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);
  const canDelete = Boolean(screenControl.fnDelete && getPrivilegeData(PRIVILEGE_DELETE).active);

  useEffect(() => {
    dispatch(onTitleEdit("menu.billingPurchaseOrders"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/billingPurchaseOrders`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} screenControl={screenControl} canDelete={canDelete} />
    </Suspense>
  )
};

export default Format;
