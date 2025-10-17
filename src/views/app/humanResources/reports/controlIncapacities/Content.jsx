import React from 'react'
import ReactTable from '@Components/reactTable';
import { useControlIncapacities } from './useControlIncapacities'
import Header from './Header';

const Content = ({setLoading, adminControl}) => {
  const {table, propsToHeader} = useControlIncapacities({setLoading, adminControl})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content