import React from 'react'
import ReactTable from '@Components/reactTable'
import { useStaffDepartures } from './useStaffDepartures'
import Header from './Header';

const Content = ({setLoading}) => {

  const {propsToHeader, table} = useStaffDepartures({setLoading});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content