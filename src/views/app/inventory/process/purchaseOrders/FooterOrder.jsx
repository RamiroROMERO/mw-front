import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { formatNumber } from '@Helpers/Utils'
import { Row } from 'reactstrap'
import { MAX_APPLICANT, MAX_DESCRIPTION_OTHERS } from './purchaseOrderRules'

const FooterOrder = ({applicantName, workOrderId, notes, valueExonerated, valueExempt, valueTaxed, valueDiscount, valueTax,
  valueOthers, valueTotal, descriptionOthers, listWorkOrders, orderDetail, onInputChange, fnRecalculateTotals, errors}) => {

  // Legacy (fnCalculateTotals): "Otros Recargos" es el único total que se captura a mano,
  // el resto siempre se recalcula sumando el detalle completo.
  const onOtherValueChange = e => {
    fnRecalculateTotals(orderDetail, e.target.value);
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
              maxLength={MAX_APPLICANT}
              invalid={!!errors.applicantName}
              feedbackText={errors.applicantName || null}
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
              name="valueExonerated"
              label='page.purchaseOrders.input.valueExonerated'
              value={formatNumber(valueExonerated)}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <InputField
              name="valueExempt"
              label='page.purchaseOrders.input.valueExempt'
              value={formatNumber(valueExempt)}
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
              invalid={!!errors.valueOthers}
              feedbackText={errors.valueOthers || null}
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
              maxLength={MAX_DESCRIPTION_OTHERS}
              invalid={!!errors.descriptionOthers}
              feedbackText={errors.descriptionOthers || null}
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FooterOrder