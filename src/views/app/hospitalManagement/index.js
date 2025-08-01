import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onBreadcrumbEdit, onTitleEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import Breadcrumb from '@/containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import(/* webpackChunkName: "start" */ './Content')
);
const HospitalManagement = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.hospitalManagement"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/hospitalManagement`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
};
export default HospitalManagement;