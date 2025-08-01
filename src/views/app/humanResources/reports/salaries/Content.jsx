import React from 'react'
import ReactTable from '@Components/reactTable'
import { useSalaries } from './useSalaries'
import Header from './Header';

const Salaries = ({setLoading}) => {

  const {table, propsToHeader} = useSalaries({setLoading});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Salaries