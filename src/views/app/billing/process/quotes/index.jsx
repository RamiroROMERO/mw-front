import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

// Privilegio propio de la pantalla (SPEC v2-66-sr; antes compartía 01.03.031 con las Órdenes de compra). Eliminar exige además 11.01.007 (anular documentos, el mismo
// que verificaba fnVerificarV2("11.01.007") en fac_quotes.sc2): el back valida los dos.
const PRIVILEGE_CODE = "01.03.042";
const PRIVILEGE_DELETE = "11.01.007";

const Format = (props) => {
  const dispatch = useDispatch();
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);
  const canDelete = Boolean(screenControl.fnDelete && getPrivilegeData(PRIVILEGE_DELETE).active);

  useEffect(() => {
    dispatch(onTitleEdit("menu.quotes"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/quotes`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} screenControl={screenControl} canDelete={canDelete} />
    </Suspense>
  )
};

export default Format;
