import React from 'react'
import ReactTable from '@Components/reactTable'
import { useSalaries } from './useSalaries'
import Header from './Header';

const Salaries = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = useSalaries({setLoading, adminControl});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Salaries