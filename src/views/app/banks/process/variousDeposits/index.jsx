import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@Helpers/Utils';

// Editar un depósito ya contabilizado (el back lo exige y regenera su partida; SPEC v2-24).
const EDIT_POSTED_PRIVILEGE_CODE = '11.01.015';

const Content = React.lazy(() =>
  import('./Content')
);
const VariousDeposits = (props) => {
  const dispatch = useDispatch();
  const canEditPosted = Boolean(getPrivilegeData(EDIT_POSTED_PRIVILEGE_CODE).active);

  useEffect(() => {
    dispatch(onTitleEdit("menu.variousDeposits"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/banks/process/variousDeposits`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} canEditPosted={canEditPosted} />
    </Suspense>
  )
};
export default VariousDeposits;