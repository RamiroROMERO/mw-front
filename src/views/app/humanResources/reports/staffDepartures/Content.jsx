import React from 'react'
import ReactTable from '@Components/reactTable'
import { useStaffDepartures } from './useStaffDepartures'
import Header from './Header';

const Content = ({setLoading, adminControl}) => {

  const {propsToHeader, table} = useStaffDepartures({setLoading, adminControl});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content