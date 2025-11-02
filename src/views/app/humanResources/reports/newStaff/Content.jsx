import React from 'react'
import ReactTable from '@Components/reactTable'
import Header from './Header';
import { useNewStaff } from './useNewStaff';

const Content = ({setLoading, adminControl}) => {

  const {propsToHeader, table} = useNewStaff({setLoading, adminControl});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content