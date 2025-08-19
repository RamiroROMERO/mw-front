import React from 'react'
import ReactTable from '@Components/reactTable';
import { useControlIncapacities } from './useControlIncapacities'
import Header from './Header';

const Content = ({setLoading}) => {
  const {table, propsToHeader} = useControlIncapacities({setLoading})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content