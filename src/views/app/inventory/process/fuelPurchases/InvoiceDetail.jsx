import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
// import ReactInputMask from 'react-input-mask';
import { useInvoiceDetail } from './useInvoiceDetail'

const InvoiceDetail = ({ formState, listDocuments, listProviders, listPaymentTypes, listAccounts, onInputChange, onBulkForm, formValidation, sendForm }) => {

  const { documentId, invoiceDate, invoiceExp, providerId, invoiceCode, paymentTypeId, ctaExpenseId, valSubtotal, valDiscount, valTax, valTotal, notes } = formState;

  const { onSubtotalChange, onTaxChange, onDiscountChange } = useInvoiceDetail({ onBulkForm, valTax, valDiscount, valSubtotal });

  const { documentIdValid, providerIdValid, invoiceCodeValid, paymentTypeIdValid, ctaExpenseIdValid, valTotalValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.fuelPurchases.title.invoiceDetail">
            <Row>
              <Colxx xxs="12" sm="8" lg="7">
                <Row>
                  <Colxx xxs="12" xl="6">
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
                  <Colxx xxs="12" xl="6">
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
                  <Colxx xxs="12" xl="6">
                    <InputField
                      name="invoiceCode"
                      label='input.numInvoice'
                      value={invoiceCode}
                      onChange={onInputChange}
                      type="text"
                      mask="***-***-**-********"
                      maskChar=" "
                      // tag={ReactInputMask}
                      invalid={sendForm && !!invoiceCodeValid}
                      feedbackText={sendForm && (invoiceCodeValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xl="6">
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
                  <Colxx xxs="12">
                    <SearchSelect
                      label='select.accountId'
                      name='ctaExpenseId'
                      inputValue={ctaExpenseId}
                      options={listAccounts}
                      onChange={onInputChange}
                      invalid={sendForm && !!ctaExpenseIdValid}
                      feedbackText={sendForm && (ctaExpenseIdValid || null)}
                    />
                  </Colxx>
                </Row>
              </Colxx>
              <Colxx xxs="12" sm="4" lg="5">
                <Row>
                  <Colxx xxs="12" xs="6" sm="12" lg="6">
                    <DateCalendar
                      name="invoiceDate"
                      label="select.dateInvoice"
                      value={invoiceDate}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6">
                    <DateCalendar
                      name="invoiceExp"
                      label="select.dateExpiration"
                      value={invoiceExp}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="valSubtotal"
                      label='input.subtotal'
                      value={valSubtotal}
                      onChange={onSubtotalChange}
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="valDiscount"
                      label='input.discount'
                      value={valDiscount}
                      onChange={onDiscountChange}
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="valTax"
                      label='input.tax'
                      value={valTax}
                      onChange={onTaxChange}
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="valTotal"
                      label='input.total'
                      value={valTotal}
                      onChange={onInputChange}
                      type="text"
                      disabled
                      invalid={sendForm && !!valTotalValid}
                      feedbackText={sendForm && (valTotalValid || null)}
                    />
                  </Colxx>
                </Row>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <InputField
            name="notes"
            label='input.observations'
            value={notes}
            onChange={onInputChange}
            type="textarea"
          />
        </Colxx>
      </Row>
    </>
  )
}

export default InvoiceDetail