import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import { getPrivilegeData } from '@Helpers/Utils';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

// Facturación general usa tres privilegios distintos, cada uno gateando una acción
// puntual (no todo el screenControl.fnDelete genérico como Cotizaciones/POS):
// - Anular: el genérico "Eliminar/Anular de Documentos" (99.20.004, el del legacy; SPEC v2-70-sr). Antes usaba 11.01.008 ("Anular Facturas"); el back
//   lo valida con 99.20.004 y falla cerrado, así que el botón se muestra con el mismo privilegio.
// - Editar Información de Factura: mismo código para "Editar Costo/Distribución" y
//   "Editar Información" — son dos botones distintos en el legacy pero comparten
//   privilegio.
// - Cambio de Productos: 99.01.005 (SPEC v2-72-sr). El legacy citaba 99.02.014, pero ese código ya es "Ajustar Costos y Cantidades del Kardex" (SPEC v2-56-sr).
const VOID_PRIVILEGE_CODE = "99.20.004";
const EDIT_INFO_PRIVILEGE_CODE = "99.01.004";
const CHANGE_PRODUCT_PRIVILEGE_CODE = "99.01.005";

const Invoicing = (props) => {
  const dispatch = useDispatch();
  const voidControl = getPrivilegeData(VOID_PRIVILEGE_CODE);
  const editInfoControl = getPrivilegeData(EDIT_INFO_PRIVILEGE_CODE);
  const changeProductControl = getPrivilegeData(CHANGE_PRODUCT_PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.invoicing"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/invoicing`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} voidControl={voidControl} editInfoControl={editInfoControl} changeProductControl={changeProductControl} />
    </Suspense>
  )
};

export default Invoicing;