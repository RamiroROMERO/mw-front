import React from 'react'
import ReactTable from '@Components/reactTable';
import { useBiweeklyIncomes } from './useBiweeklyIncomes'
import Header from './Header';

const Content = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = useBiweeklyIncomes({setLoading, adminControl})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content