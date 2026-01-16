import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import Breadcrumb from '@/containers/navs/Breadcrumb';
import { getPrivilegeData } from '@/helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const Quotes = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "08.02.001";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.hotelManagement.quotes"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/hotelManagement/process/quotes`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
}

export default Quotes