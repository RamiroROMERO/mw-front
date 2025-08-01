import React from 'react'
import DateCalendar from '@/components/dateCalendar'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { Form, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'

const FormOrder = ({date, providerId, number, paymentTypeId, address, creditDays, expectedDate, listProviders, listPaymenTypes,
  onInputChange, setBulkForm, formValidation, sendForm}) => {

  const {dateValid, providerIdValid, paymentTypeIdValid} = formValidation;

  const onProviderChange = e =>{
    const filterProvider = listProviders.filter((item)=>{
      return item.value === e.target.value;
    });
    const newProvider = {
      providerId: e.target.value,
      address: filterProvider[0]?filterProvider[0].address:'',
      creditDays: filterProvider[0]?filterProvider[0].creditDays:0
    }
    setBulkForm(newProvider);
  }

  return (
    <Form className='mt-3'>
      <Row>
        <Colxx xxs="12" xs="6" md="4">
          <DateCalendar
            name="date"
            label="page.purchaseOrders.input.date"
            value={date}
            onChange={onInputChange}
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && (dateValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" xs="2" md="6"> </Colxx>
        <Colxx xxs="12" xs="4" md="2">
          <InputField
            name="number"
            label='page.purchaseOrders.input.number'
            value={number}
            onChange={onInputChange}
            type="text"
            disabled
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" sm="6" md="7" lg="7" xl="6">
          <SearchSelect
            label='page.purchaseOrders.select.provider'
            inputValue={providerId}
            name="providerId"
            options={listProviders}
            onChange={onProviderChange}
            invalid={sendForm && !!providerIdValid}
            feedbackText={sendForm && (providerIdValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" md="5" lg="5" xl="4">
          <SearchSelect
            label='page.purchaseOrders.select.paymentTypeId'
            inputValue={paymentTypeId}
            name='paymentTypeId'
            options={listPaymenTypes}
            onChange={onInputChange}
            invalid={sendForm && !!paymentTypeIdValid}
            feedbackText={sendForm && (paymentTypeIdValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="12" lg="6">
          <InputField
            name="address"
            label='page.purchaseOrders.input.address'
            value={address}
            onChange={onInputChange}
            type="text"
            disabled
          />
        </Colxx>
        <Colxx xxs="12" xs="5" md="3" lg="2">
          <InputField
            name="creditDays"
            label='page.purchaseOrders.input.creditDays'
            value={creditDays}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
        <Colxx xxs="12" xs="7" md="4" lg="4">
          <DateCalendar
            name="expectedDate"
            label="page.purchaseOrders.input.expectedDate"
            value={expectedDate}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
    </Form>
  )
}

export default FormOrder