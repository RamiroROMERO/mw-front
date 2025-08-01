import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { SimpleSelect } from '@/components/simpleSelect'
import { Form, Row } from 'reactstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
// import ReactInputMask from 'react-input-mask';
import DateCalendar from '@/components/dateCalendar'
import { RadioGroup } from '@/components/radioGroup'
import { validInt } from '@/helpers/Utils'

const FormPurchase = ({ documentCode, storeId, providerId, paymentTypeId, cai, numCai, date, dateOut, nameRequire, orderId,
  typeDocto, listDocuments, listStores, listProviders, listPaymentTypes, onInputChange, setBulkForm, formValidation, sendForm }) => {

  const { documentCodeValid, providerIdValid, caiValid, numCaiValid, dateValid, dateOutValid, typeDoctoValid } = formValidation;

  const onProviderChange = e => {
    const filterProv = listProviders.find(item => item.value === validInt(e.target.value));

    const newProv = {
      providerType: filterProv ? filterProv.providerType : 0,
      providerId: e.target.value,
      cai: filterProv ? filterProv.cai : ''
    }
    setBulkForm(newProv);
  }

  return (
    <Form className='mt-3'>
      <Row>
        <Colxx className="order-xs-2 order-lg-1" xxs="12" lg="8" xl="9">
          <Row>
            <Colxx xxs="12" md="6">
              <SearchSelect
                label='page.purchases.input.document'
                name='documentCode'
                inputValue={documentCode}
                options={listDocuments}
                onChange={onInputChange}
                invalid={sendForm && !!documentCodeValid}
                feedbackText={sendForm && (documentCodeValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <SearchSelect
                label='page.purchases.input.providerId'
                name='providerId'
                inputValue={providerId}
                options={listProviders}
                onChange={onProviderChange}
                invalid={sendForm && !!providerIdValid}
                feedbackText={sendForm && (providerIdValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <InputField
                name="cai"
                label='page.purchases.input.cai'
                value={cai}
                onChange={onInputChange}
                type="text"
                mask="******-******-******-******-******-**"
                maskChar=" "
                // tag={ReactInputMask}
                invalid={sendForm && !!caiValid}
                feedbackText={sendForm && (caiValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <InputField
                name="numCai"
                label='page.purchases.input.numCai'
                value={numCai}
                onChange={onInputChange}
                type="text"
                mask="***-***-**-********"
                maskChar=" "
                // tag={ReactInputMask}
                invalid={sendForm && !!numCaiValid}
                feedbackText={sendForm && (numCaiValid || null)}
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12" sm="6" xl="4">
              <SimpleSelect
                name="storeId"
                label="page.purchases.input.storeId"
                value={storeId}
                onChange={onInputChange}
                options={listStores}
              />
            </Colxx>
            <Colxx xxs="12" sm="6" xl="4">
              <SearchSelect
                label='page.purchases.select.paymentTypeId'
                inputValue={paymentTypeId}
                name='paymentTypeId'
                options={listPaymentTypes}
                onChange={onInputChange}
              />
            </Colxx>
            <Colxx xxs="12" sm="12" xl="4">
              <InputField
                name="nameRequire"
                label='page.purchases.input.nameRequire'
                value={nameRequire}
                onChange={onInputChange}
                type="text"
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx className="order-xs-1 order-lg-2" xxs="12" lg="4" xl="3">
          <Row>
            <Colxx xxs="12" xs="6" lg="12">
              <DateCalendar
                name="date"
                label="page.purchases.input.date"
                value={date}
                onChange={onInputChange}
                invalid={sendForm && !!dateValid}
                feedbackText={sendForm && (dateValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <DateCalendar
                name="dateOut"
                label="page.purchases.input.dateOut"
                value={dateOut}
                onChange={onInputChange}
                invalid={sendForm && !!dateOutValid}
                feedbackText={sendForm && (dateOutValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <RadioGroup
                label="page.purchases.radio.typePurchase"
                name="typeDocto"
                value={typeDocto}
                onChange={onInputChange}
                options={[
                  { id: 1, label: 'page.purchases.radio.cash' },
                  { id: 2, label: 'page.purchases.radio.credit' }
                ]}
                display='flex'
                invalid={sendForm && !!typeDoctoValid}
                feedbackText={sendForm && (typeDoctoValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <InputField
                name="orderId"
                label='page.purchases.input.orderId'
                value={orderId}
                onChange={onInputChange}
                type="text"
                disabled
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </Form>
  )
}

export default FormPurchase