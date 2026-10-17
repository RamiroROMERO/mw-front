import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@Helpers/Utils';
import { COSTS_PRIVILEGE_CODE, hasCostsPrivilege } from './costRules';
import { STORE_PRIVILEGE_CODE, hasRefreshStockPrivilege } from './stockRules';

const Content = React.lazy(() =>
  import('./Content')
);
const ProductsCatalog = (props) => {
  const dispatch = useDispatch();
  // Editar Costos Promedio (SPEC v2-10-sr): sin este privilegio no se muestra el botón "Costos" (el back también lo exige).
  const canEditCosts = hasCostsPrivilege(getPrivilegeData(COSTS_PRIVILEGE_CODE));

  // Actualizar existencias llama a productsStore/refreshStock (01.05.006): sin ese privilegio el botón no se muestra.
  const canRefreshStock = hasRefreshStockPrivilege(getPrivilegeData(STORE_PRIVILEGE_CODE));

  useEffect(() => {
    dispatch(onTitleEdit("menu.productsCatalog"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/inventory/settings/productsCatalog`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} canEditCosts={canEditCosts} canRefreshStock={canRefreshStock} />
    </Suspense>
  )
};

export default ProductsCatalog;