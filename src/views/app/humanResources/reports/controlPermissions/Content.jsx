import React from 'react'
import ReactTable from '@Components/reactTable';
import { useControlPermissions } from './useControlPermissions';
import Header from './Header';

const ControlPermissions = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = useControlPermissions({setLoading, adminControl})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default ControlPermissions;
