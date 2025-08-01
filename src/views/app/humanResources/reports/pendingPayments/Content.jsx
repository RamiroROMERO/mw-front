import React from 'react'
import ReactTable from '@Components/reactTable'
import { usePendingPayments } from './usePendingPayments'

const PendingPayments = ({setLoading}) => {

  const {table} = usePendingPayments({setLoading});

  return (
    <>
      <ReactTable {...table}/>
    </>
  )
}

export default PendingPayments