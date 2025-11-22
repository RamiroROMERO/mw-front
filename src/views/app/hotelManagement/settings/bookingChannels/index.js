import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import { getPrivilegeData } from '@/helpers/Utils';
import Breadcrumb from '@/containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);

const BookingChannels = (props) => {
  const dispatch = useDispatch();

  const PRIVILEGE_CODE = "08.01.010";
  const screenControl = getPrivilegeData(PRIVILEGE_CODE);

  useEffect(() => {
    dispatch(onTitleEdit("menu.bookingChannels"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/hotelManagement/settings/bookingChannels`))
  }, []);

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content screenControl={screenControl} {...props} />
    </Suspense>
  )
}

export default BookingChannels