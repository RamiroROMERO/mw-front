import React from 'react'
import ReactTable from '@Components/reactTable'
import Header from './Header'
import { useControlVacations } from './useControlVacations'

const ControlVacations = ({setLoading}) => {

  const {table, propsToHeader} = useControlVacations({setLoading})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default ControlVacations