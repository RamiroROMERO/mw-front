import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import DateCalendar from '@/components/dateCalendar'
import SearchSelect from '@/components/SearchSelect/SearchSelect'

const FormTicket = ({documentId, providerId, paymentTypeId, date, purchaseOrder, listDocuments, listProviders, listPaymentTypes, onInputChange, sendForm, formValidation}) => {

  const {documentIdValid, dateValid, providerIdValid, paymentTypeIdValid} = formValidation;

  return (
    <Row>
      <Colxx xxs="12" sm="8" lg="9" xl="10">
        <Row>
          <Colxx xxs="12" lg="6" xl="4">
            <SearchSelect
              label='select.documentId'
              name='documentId'
              inputValue={documentId}
              options={listDocuments}
              onChange={onInputChange}
              invalid={sendForm && !!documentIdValid}
              feedbackText={sendForm && (documentIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" lg="6" xl="5">
            <SearchSelect
              label='select.providerId'
              name='providerId'
              inputValue={providerId}
              options={listProviders}
              onChange={onInputChange}
              invalid={sendForm && !!providerIdValid}
              feedbackText={sendForm && (providerIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" lg="6" xl="3">
            <SearchSelect
              label='select.paymentMethod'
              name='paymentTypeId'
              inputValue={paymentTypeId}
              options={listPaymentTypes}
              onChange={onInputChange}
              invalid={sendForm && !!paymentTypeIdValid}
              feedbackText={sendForm && (paymentTypeIdValid || null)}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" sm="4" lg="3" xl="2">
        <Row>
          <Colxx xxs="12" xs="7" sm="12">
            <DateCalendar
              name="date"
              label="select.date"
              value={date}
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="5" sm="12">
            <InputField
              name="purchaseOrder"
              label='input.purchaseOrder'
              value={purchaseOrder}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FormTicket