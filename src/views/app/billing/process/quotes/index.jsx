import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

// Valida si el usuario puede anular/eliminar documentos (misma verificación que el
// legacy hacía con fnVerificarV2("11.01.007") en fac_quotes.sc2).
const PRIVILEGE_CODE = "11.01.007";

const Format = (props) => {
  const dispatch = useDispatch();
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.quotes"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/quotes`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} screenControl={screenControl} />
    </Suspense>
  )
};

export default Format;
