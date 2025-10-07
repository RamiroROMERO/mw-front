import React from 'react'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { useModalAddService } from './useModalAddService';

const ModalAddService = ({data, setOpen}) => {
  const {bookingId, currentService, listServices, setLoading, fnGetDataServices} = data;

  const {formState, formValidation, sendForm, onInputChange, onQtyChange, onServiceChange, onTaxPercentChange, onTaxChange, fnSave} = useModalAddService({bookingId, currentService, setLoading, fnGetDataServices, listServices, setOpen})

  const {serviceId, date, notes, qty, price, subtotal, taxPercent, tax, total} = formState;

  const {dateValid, serviceIdValid} = formValidation;

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
            label='select.service'
            name='serviceId'
            inputValue={serviceId}
            options={listServices}
            onChange={onServiceChange}
            invalid={sendForm && !!serviceIdValid}
            feedbackText={sendForm && (serviceIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="qty"
            label='input.qty'
            value={qty}
            onChange={onQtyChange}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="price"
            label='input.price'
            value={price}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="subtotal"
            label='input.subtotal'
            value={subtotal}
            onChange={onInputChange}
            disabled
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="taxPercent"
            label='input.taxPercent'
            value={taxPercent}
            onChange={onTaxPercentChange}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="tax"
            label='input.tax'
            value={tax}
            onChange={onTaxChange}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <InputField
            name="total"
            label='input.total'
            value={total}
            onChange={onInputChange}
            disabled
          />
        </Colxx>
        <Colxx xxs={12}>
          <InputField
            name="notes"
            label='input.notes'
            value={notes}
            onChange={onInputChange}
            type='textarea'
            style={{resize:'none'}}
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

export default ModalAddService