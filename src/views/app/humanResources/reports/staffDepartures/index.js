import React, { Suspense, useEffect } from 'react'
import { adminRoot } from '@Constants/defaultValues';
import { onBreadcrumbEdit, onTitleEdit } from '@Redux/actions';
import { useDispatch } from 'react-redux';
import Breadcrumb from '@Containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

const StaffDepartures = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.staffDepartures"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/humanResources/reports/staffDepartures`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
}

export default StaffDepartures