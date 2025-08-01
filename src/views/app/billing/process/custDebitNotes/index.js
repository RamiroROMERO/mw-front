import React, { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onTitleEdit, onBreadcrumbEdit } from '@/redux/actions';
import { adminRoot } from '@/constants/defaultValues';
import Breadcrumb from '@/containers/navs/Breadcrumb';

const Content = React.lazy(() =>
  import('./Content')
);
const CustDebitNotes = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(onTitleEdit("menu.custDebitNotes"))
    dispatch(onBreadcrumbEdit(`${adminRoot}/billing/process/custDebitNotes`))
  }, [])

  return (
    <Suspense fallback={<div className="loading" />}>
      <Breadcrumb />
      <Content {...props} />
    </Suspense>
  )
};

export default CustDebitNotes;