import React from 'react'
import ReactTable from '@Components/reactTable';
import { useControlPermissions } from './useControlPermissions';
import Header from './Header';

const ControlPermissions = ({setLoading}) => {

  const {table, propsToHeader} = useControlPermissions({setLoading})

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default ControlPermissions;
