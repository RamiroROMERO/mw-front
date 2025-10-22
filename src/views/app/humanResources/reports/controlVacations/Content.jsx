import React from 'react'
import ReactTable from '@Components/reactTable'
import Header from './Header'
import { useControlVacations } from './useControlVacations'

const ControlVacations = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = useControlVacations({setLoading, adminControl})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default ControlVacations