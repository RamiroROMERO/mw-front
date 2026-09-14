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
// - Anular Facturas: específico de esta pantalla, distinto del genérico "Eliminar/Anular
//   de Documentos" que usa Cotizaciones (ver memoria del proyecto, confirmado por el
//   usuario 2026-09-10).
// - Editar Información de Factura: mismo código para "Editar Costo/Distribución" y
//   "Editar Información" — son dos botones distintos en el legacy pero comparten
//   privilegio.
// - Cambio de Productos: código citado literalmente por el legacy, no confirmado contra
//   el catálogo local de accesos (puede estar desactualizado).
const VOID_PRIVILEGE_CODE = "11.01.008";
const EDIT_INFO_PRIVILEGE_CODE = "11.01.032";
const CHANGE_PRODUCT_PRIVILEGE_CODE = "11.01.033";

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