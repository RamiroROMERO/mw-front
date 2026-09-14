import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

// Un solo privilegio (01.03.036 "Proceso -> Notas de Crédito") gatea Guardar,
// Contabilizar y Eliminar/Anular — el legacy no distingue permisos por botón dentro de
// esta pantalla (confirmado en el análisis, ver memoria del proyecto).
const PRIVILEGE_CODE = "01.03.036";

const CustCreditNotes = (props) => {
  const dispatch = useDispatch();
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.custCreditNotes"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/custCreditNotes`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} screenControl={screenControl} />
    </Suspense>
  )
};

export default CustCreditNotes;
