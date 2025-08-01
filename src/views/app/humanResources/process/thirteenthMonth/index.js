import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);
const ThirteenthMonth = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.thirteenthMonth"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/process/thirteenthMonth`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
};

export default ThirteenthMonth;