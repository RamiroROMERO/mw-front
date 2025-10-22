import React from 'react'
import ReactTable from '@Components/reactTable'
import { usePendingPayments } from './usePendingPayments'

const PendingPayments = ({setLoading, adminControl}) => {

  const {table} = usePendingPayments({setLoading, adminControl});

  return (
    <>
      <ReactTable {...table}/>
    </>
  )
}

export default PendingPayments