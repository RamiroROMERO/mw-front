import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onBreadcrumbEdit, onTitleEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import(/* webpackChunkName: "start" */ './Content')
);
const Accounting = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.accounting"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/accounting`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
};
export default Accounting;