import React, { Suspense, useEffect } from 'react'
import { onBreadcrumbEdit, onTitleEdit } from '@Redux/actions';
import { useDispatch } from 'react-redux';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

const Salaries = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.salaries"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/salaries`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
}

export default Salaries