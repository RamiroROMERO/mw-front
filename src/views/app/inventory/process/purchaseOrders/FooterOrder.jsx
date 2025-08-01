import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { formatNumber, validFloat } from '@/helpers/Utils'
import React from 'react'
import { Row } from 'reactstrap'

const FooterOrder = ({applicantName, workOrderId, notes, valueExcent, valueTaxed, valueDiscount, valueTax,
  valueOthers, valueTotal, descriptionOthers, listWorkOrders, onInputChange, setBulkForm}) => {

  const onOtherValueChange = e=>{
    const total = validFloat(valueExcent) + validFloat(valueTaxed) + validFloat(valueTax) + validFloat(e.target.value) - validFloat(valueDiscount);
    const newValue = {
      valueTotal: total,
      valueOthers: e.target.value
    }
    setBulkForm(newValue);
  }

  return (
    <Row className='mt-3'>
      <Colxx xxs="12" sm="7" md="8">
        <Row>
          <Colxx xxs="12" lg="6">
            <InputField
              name="applicantName"
              label='page.purchaseOrders.input.applicantName'
              value={applicantName}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" lg="6">
            <SearchSelect
              label='page.purchaseOrders.select.workOrder'
              name='workOrderId'
              inputValue={workOrderId}
              options={listWorkOrders}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="notes"
              label='page.purchaseOrders.input.notes'
              value={notes}
              onChange={onInputChange}
              type="textarea"
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" sm="5" md="4">
        <Row>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueExcent"
              label='page.purchaseOrders.input.valueExcent'
              value={formatNumber(valueExcent)}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueTaxed"
              label='page.purchaseOrders.input.valueTaxed'
              value={formatNumber(valueTaxed)}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueDiscount"
              label='page.purchaseOrders.input.valueDiscount'
              value={formatNumber(valueDiscount)}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueTax"
              label='page.purchaseOrders.input.valueTax'
              value={formatNumber(valueTax)}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueOthers"
              label='page.purchaseOrders.input.valueOthers'
              value={valueOthers}
              onChange={onOtherValueChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueTotal"
              label='page.purchaseOrders.input.valueTotal'
              value={formatNumber(valueTotal)}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="descriptionOthers"
              label="page.purchaseOrders.input.descriptionOthers"
              value={descriptionOthers}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FooterOrder