import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { RadioGroup } from '@/components/radioGroup'
import { IntlMessages, validFloat } from '@/helpers/Utils'
import { useForm } from '@/hooks'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { InputField } from '@/components/inputFields'

const ModalDiscounts = ({data, setOpen}) => {
  const {orderDetail, setOrderDetail, setBulkForm} = data;
  const {formState, onInputChange, onResetForm, setBulkForm: setBulkFormDisc} = useForm({
    typeDiscount: 1,
    valueDiscount: 0
  });

  const {typeDiscount, valueDiscount} = formState;

  const fnChangeDiscount = ()=>{
    const sumSubtotal = orderDetail.map(item => validFloat(item.subTotal)).reduce((prev, curr) => prev + curr, 0);

    let discPercent = 0;
    if(typeDiscount === '2'){
      discPercent = (validFloat(valueDiscount)/sumSubtotal)*100;
    }else{
      discPercent = valueDiscount;
    }

    const newDiscount =  orderDetail.map((item)=>{
      item.discount = (item.subTotal * validFloat(discPercent))/100
      item.percentDiscount = validFloat(discPercent)
      item.total = validFloat(item.subTotal) - ((item.subTotal * validFloat(discPercent))/100) + validFloat(item.tax)
      return item;
    });

    const sumDiscount = newDiscount.map(item => validFloat(item.discount)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = newDiscount.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
    const updateDisc = {
      valueDiscount: sumDiscount,
      valueTotal: sumTotal
    }
    setBulkForm(updateDisc);
    setOrderDetail(newDiscount);
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