import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { formatNumber } from '@Helpers/Utils'

const FooterPayroll = ({dataTotals}) => {
  return (
    <>
    <hr/>
    <Row className='mt-4'>
      <Colxx xxs={12} xs={6} md={4} lg={3} xxl={2}>
        <InputField
          name='totalRegularValue'
          label='page.dailyPayroll.table.totalRegularValue'
          value={formatNumber(dataTotals.totalRegularValue)}
          type='text'
          disabled
          bold
        />
      </Colxx>
      <Colxx xxs={12} xs={6} md={4} lg={3} xxl={2}>
        <InputField
          name='totalOvertimeValue'
          label='page.dailyPayroll.table.totalOvertimeValue'
          value={formatNumber(dataTotals.totalOvertimeValue)}
          type='text'
          disabled
          bold
        />
      </Colxx>
      <Colxx xxs={12} xs={6} md={4} lg={3} xxl={2}>
        <InputField
          name='totalValue'
          label='page.dailyPayroll.table.totalValue'
          value={formatNumber(dataTotals.totalValue)}
          type='text'
          disabled
          bold
        />
      </Colxx>
    </Row>
    </>
  )
}

export default FooterPayroll