import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import Breadcrumb from '@/containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);
const ModuleAudit = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.moduleAudit"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/accounting/reports/moduleAudit`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
};

export default ModuleAudit;