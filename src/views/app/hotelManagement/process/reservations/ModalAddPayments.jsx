import React from 'react'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useModalAddPayments } from './useModalAddPayments';
import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { InputField } from '@/components/inputFields';

const ModalAddPayments = ({data, setOpen}) => {
  const {bookingId, currentPayment, listPaymentTypes, setLoading, fnGetDataPayments} = data;

  const {formState, formValidation, sendForm, onInputChange, fnSave} = useModalAddPayments({bookingId, currentPayment, setLoading, fnGetDataPayments, setOpen});

  const {date, paymentTypeId, code, value} = formState;

  const {dateValid, paymentTypeIdValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} sm={6} md={8}>
          <DateCalendar
            name="date"
            value={date}
            label='select.date'
            onChange={onInputChange}
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && (dateValid || null)}
          />
        </Colxx>
        <Colxx xxs={12}>
          <SearchSelect
            label='select.paymentType'
            name='paymentTypeId'
            inputValue={paymentTypeId}
            options={listPaymentTypes}
            onChange={onInputChange}
            invalid={sendForm && !!paymentTypeIdValid}
            feedbackText={sendForm && (paymentTypeIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="code"
            label='input.code'
            value={code}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="value"
            label='input.value'
            value={value}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
    </ModalFooter>
    </>
  )
}

export default ModalAddPayments