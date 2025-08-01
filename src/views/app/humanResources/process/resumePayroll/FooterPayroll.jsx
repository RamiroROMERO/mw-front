import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { formatNumber } from '@Helpers/Utils'

const FooterPayroll = ({dataTotals, typePayroll}) => {
  return (
    <Row className='mt-4'>
      <Colxx xxs={12} xs={6} md={4} lg={3} xxl={2} style={{ display: typePayroll===1?"block":"none" }}>
        <InputField
          name='totalIncomes'
          label='page.resumePayroll.table.totalIncome'
          value={formatNumber(dataTotals.totalIncomes)}
          type='text'
          disabled
        />
      </Colxx>
      <Colxx xxs={12} xs={6} md={4} lg={3} xxl={2} style={{ display: typePayroll===1?"block":"none" }}>
        <InputField
          name='totalDeductions'
          label='page.resumePayroll.table.totalDeductions'
          value={formatNumber(dataTotals.totalDeductions)}
          type='text'
          disabled
        />
      </Colxx>
      <Colxx xxs={12} xs={6} md={4} lg={3} xxl={2}>
        <InputField
          name='totalPayment'
          label='page.resumePayroll.table.totalPayment'
          value={formatNumber(dataTotals.totalPayment)}
          type='text'
          disabled
        />
      </Colxx>
    </Row>
  )
}

export default FooterPayroll