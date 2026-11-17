import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@Helpers/Utils';
import { ADJUST_PRIVILEGE_CODE, hasAdjustPrivilege } from './costAdjustmentRules';

const Content = React.lazy(() =>
  import('./Content')
);
const CostAdjustment = (props) => {
  const dispatch = useDispatch();
  // Ajustar Costos y Cantidades del Kardex (SPEC v2-56-sr): sin este privilegio no se muestra Guardar (el back también lo exige).
  const canAdjust = hasAdjustPrivilege(getPrivilegeData(ADJUST_PRIVILEGE_CODE));

  useEffect(() => {
    dispatch(onTitleEdit("menu.costAdjustment"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/inventory/process/costAdjustment`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} canAdjust={canAdjust} />
    </Suspense>
  )
};

export default CostAdjustment;