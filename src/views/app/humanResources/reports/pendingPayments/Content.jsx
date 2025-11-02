import React from 'react'
import ReactTable from '@Components/reactTable'
import { usePendingPayments } from './usePendingPayments'
import Header from './Header';

const PendingPayments = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = usePendingPayments({setLoading, adminControl});


  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default PendingPayments