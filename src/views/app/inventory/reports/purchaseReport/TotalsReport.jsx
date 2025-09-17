import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { formatNumber } from '@/helpers/Utils'

const TotalsReport = ({subtotal, exoneratedValue, exemptValue, taxedValue, discount, tax, fleteValue, otherChargesValue, total, month_1, month_2, month_3, month_4, month_5, month_6, month_7, month_8, month_9, month_10, month_11, month_12}) => {
  return (
    <Row>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: subtotal!==undefined?'block':'none'}}>
        <InputField
          name="subtotal"
          label='input.subtotal'
          value={formatNumber(subtotal)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: exoneratedValue!==undefined?'block':'none'}}>
        <InputField
          name="exoneratedValue"
          label='input.exoneratedValue'
          value={formatNumber(exoneratedValue)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: exemptValue!==undefined?'block':'none'}}>
        <InputField
          name="exemptValue"
          label='input.exemptValue'
          value={formatNumber(exemptValue)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: taxedValue!==undefined?'block':'none'}}>
        <InputField
          name="taxedValue"
          label='input.taxedValue'
          value={formatNumber(taxedValue)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: discount!==undefined?'block':'none'}}>
        <InputField
          name="discount"
          label='input.discount'
          value={formatNumber(discount)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: tax!==undefined?'block':'none'}}>
        <InputField
          name="tax"
          label='input.tax'
          value={formatNumber(tax)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: fleteValue!==undefined?'block':'none'}}>
        <InputField
          name="fleteValue"
          label='input.fleteValue'
          value={formatNumber(fleteValue)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: otherChargesValue!==undefined?'block':'none'}}>
        <InputField
          name="otherChargesValue"
          label='input.otherChargesValue'
          value={formatNumber(otherChargesValue)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_1!==undefined?'block':'none'}}>
        <InputField
          name="month_1"
          label='input.month1'
          value={formatNumber(month_1)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_2!==undefined?'block':'none'}}>
        <InputField
          name="month_2"
          label='input.month2'
          value={formatNumber(month_2)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_3!==undefined?'block':'none'}}>
        <InputField
          name="month_3"
          label='input.month3'
          value={formatNumber(month_3)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_4!==undefined?'block':'none'}}>
        <InputField
          name="month_4"
          label='input.month4'
          value={formatNumber(month_4)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_5!==undefined?'block':'none'}}>
        <InputField
          name="month_5"
          label='input.month5'
          value={formatNumber(month_5)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_6!==undefined?'block':'none'}}>
        <InputField
          name="month_6"
          label='input.month6'
          value={formatNumber(month_6)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_7!==undefined?'block':'none'}}>
        <InputField
          name="month_7"
          label='input.month7'
          value={formatNumber(month_7)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_8!==undefined?'block':'none'}}>
        <InputField
          name="month_8"
          label='input.month8'
          value={formatNumber(month_8)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_9!==undefined?'block':'none'}}>
        <InputField
          name="month_9"
          label='input.month9'
          value={formatNumber(month_9)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_10!==undefined?'block':'none'}}>
        <InputField
          name="month_10"
          label='input.month10'
          value={formatNumber(month_10)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_11!==undefined?'block':'none'}}>
        <InputField
          name="month_11"
          label='input.month11'
          value={formatNumber(month_11)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: month_12!==undefined?'block':'none'}}>
        <InputField
          name="month_12"
          label='input.month12'
          value={formatNumber(month_12)}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{display: total!==undefined?'block':'none'}}>
        <InputField
          name="total"
          label='input.total'
          value={formatNumber(total)}
          type="text"
          disabled
        />
      </Colxx>
    </Row>
  )
}

export default TotalsReport