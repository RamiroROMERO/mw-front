import React from 'react'
import ReactTable from '@Components/reactTable'
import { usePendingBenefits } from './usePendingBenefits';
import Header from './Header';

const Content = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = usePendingBenefits({setLoading, adminControl});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content