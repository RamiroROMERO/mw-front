import React from 'react'
import ReactTable from '@Components/reactTable'
import { useProjectTransfers } from './useProjectTransfers'
import Header from './Header';

const Content = ({setLoading}) => {

  const {propsToHeader, table} = useProjectTransfers({setLoading});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content