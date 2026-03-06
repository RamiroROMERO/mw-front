import React from 'react'
import ReactTable from '@Components/reactTable';
import { useControlAbsences } from './useControlAbsences'
import Header from './Header'

const Content = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = useControlAbsences({setLoading, adminControl})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content