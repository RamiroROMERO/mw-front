import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'

const TotalsReport = ({subtotal, discount, tax, total, onInputChangeTotals}) => {
  return (
    <Row>
      <Colxx xxs="12" xxl="4"> </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
        <InputField
          name="subtotal"
          label='input.subtotal'
          value={subtotal}
          onChange={onInputChangeTotals}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
        <InputField
          name="discount"
          label='input.discount'
          value={discount}
          onChange={onInputChangeTotals}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
        <InputField
          name="tax"
          label='input.tax'
          value={tax}
          onChange={onInputChangeTotals}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
        <InputField
          name="total"
          label='input.total'
          value={total}
          onChange={onInputChangeTotals}
          type="text"
          disabled
        />
      </Colxx>
    </Row>
  )
}

export default TotalsReport