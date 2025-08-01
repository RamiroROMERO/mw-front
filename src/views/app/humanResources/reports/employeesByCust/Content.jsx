import React from 'react'
import ReactTable from '@Components/reactTable'
import Header from './Header';
import { useEmployeesByCust } from './useEmployeesByCust'

const Content = ({setLoading}) => {

  const {propsToHeader, table} = useEmployeesByCust({setLoading});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content