import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@Redux/actions';
import { adminRoot } from '@Constants/defaultValues';
import Breadcrumb from '@Containers/navs/Breadcrumb';
import { getPrivilegeData } from '@Helpers/Utils';

const Content = React.lazy(() =>
  import('./Content')
);

const Rooms = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "08.01.006";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.rooms"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/hotelManagement/settings/rooms`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
}

export default Rooms