import { Colxx } from '@Components/common/CustomBootstrap'
import { RadioGroup } from '@Components/radioGroup'
import { IntlMessages } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications'
import { applyManualDiscount } from './purchaseOrderRules'
import { useForm } from '@Hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { InputField } from '@Components/inputFields'

const ModalDiscounts = ({data, setOpen}) => {
  const {orderDetail, setOrderDetail, fnRecalculateTotals} = data;
  const {formState, onInputChange, onResetForm, setBulkForm: setBulkFormDisc} = useForm({
    typeDiscount: 1,
    valueDiscount: 0
  });

  const {typeDiscount, valueDiscount} = formState;

  // Legacy (Inv_OCDescMan): descuento a todo el detalle, por porcentaje o por valor; recalcula descuento, impuesto y total de
  // cada línea con las reglas del back (purchaseOrderRules.js).
  const fnChangeDiscount = ()=>{
    const result = applyManualDiscount(orderDetail, { mode: String(typeDiscount) === '2' ? 'value' : 'percent', amount: valueDiscount });
    if (result.error) {
      notification('warning', result.error, 'alert.warning.title');
      return;
    }
    setOrderDetail(result.details);
    fnRecalculateTotals(result.details);
    setOpen(false);
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <RadioGroup
            label="page.purchaseOrders.modal.discounts.radio.type"
            name="typeDiscount"
            value={typeDiscount}
            onChange={onInputChange}
            options={[
              {id: 1, label: "page.purchaseOrders.modal.discounts.radio.percent"},
              {id: 2, label: "page.purchaseOrders.modal.discounts.radio.value"}
            ]}
            display="flex"
          />
        </Colxx>
        <Colxx xxs="12" sm="6">
          <InputField
            name="valueDiscount"
            label='page.purchaseOrders.modal.discounts.input.valueDiscount'
            value={valueDiscount}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnChangeDiscount}>
        <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalDiscounts