import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);
const InputOutputs = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.employeesByCust"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/employeesByCust`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
};

export default InputOutputs;