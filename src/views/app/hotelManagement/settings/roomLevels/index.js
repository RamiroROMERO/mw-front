import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import { getPrivilegeData } from '@/helpers/Utils';
import Breadcrumb from '@/containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

const RoomLevels = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "07.01.002";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.roomsLevels"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/hotelManagement/settings/roomsLevels`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
}

export default RoomLevels