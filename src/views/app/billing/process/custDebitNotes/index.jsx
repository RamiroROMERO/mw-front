import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

// Un solo privilegio (01.03.035 "Proceso -> Notas de Débito") gatea Guardar,
// Contabilizar y Eliminar/Anular — mismo criterio que Notas de Crédito (01.03.036).
const PRIVILEGE_CODE = "01.03.035";

const CustDebitNotes = (props) => {
  const dispatch = useDispatch();
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.custDebitNotes"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/custDebitNotes`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} screenControl={screenControl} />
    </Suspense>
  )
};

export default CustDebitNotes;
