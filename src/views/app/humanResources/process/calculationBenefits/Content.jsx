import React from 'react'
import { useCalculationBenefits } from './useCalculationBenefits'
import Header from './Header';
import Detail from './Detail';

const Content = ({ setLoading, adminControl }) => {

  const {propsToHeader, dataBenefits, totalBenefits, setOtherPayments, setTotalBenefits} = useCalculationBenefits({setLoading, adminControl});

  return (
    <>
      <Header {...propsToHeader}/>
      <Detail dataBenefits={dataBenefits} setOtherPayments={setOtherPayments} totalBenefits={totalBenefits} setTotalBenefits={setTotalBenefits} />
    </>
  )
}

export default Content