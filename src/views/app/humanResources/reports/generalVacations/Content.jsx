import React from 'react'
import ReactTable from '@Components/reactTable';
import { useGeneralVacations } from './useGeneralVacations'
import Header from './Header'

const Content = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = useGeneralVacations({setLoading, adminControl})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content