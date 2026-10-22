import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@Helpers/Utils';
import { COSTS_PRIVILEGE_CODE, hasCostsPrivilege } from './costsAndPricesRules';

const Content = React.lazy(() =>
  import('./Content')
);
const CostsAndPrices = (props) => {
  const dispatch = useDispatch();
  // Editar Costos Promedio (11.01.003): sin este privilegio la columna de costo es de solo lectura (el back también lo exige).
  const canEditCosts = hasCostsPrivilege(getPrivilegeData(COSTS_PRIVILEGE_CODE));

  useEffect(() => {
    dispatch(onTitleEdit("menu.costsAndPrices"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/inventory/settings/costsAndPrices`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} canEditCosts={canEditCosts} />
    </Suspense>
  )
};

export default CostsAndPrices;
