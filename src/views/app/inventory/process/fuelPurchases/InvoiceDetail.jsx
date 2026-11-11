import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
// import ReactInputMask from 'react-input-mask';
import { useInvoiceDetail } from './useInvoiceDetail'

const InvoiceDetail = ({ formState, listDocuments, listProviders, listPaymentTypes, listAccounts, onInputChange, onBulkForm, formValidation, sendForm, processed }) => {

  const { documentTypeId, invoiceDate, dueDate, providerId, invoiceNumber, paymentTypeId, expenseCtaCode, subtotal, discount, tax, total, notes } = formState;

  const { onSubtotalChange, onTaxChange, onDiscountChange } = useInvoiceDetail({ onBulkForm, tax, discount, subtotal });

  const { documentTypeIdValid, providerIdValid, invoiceNumberValid, paymentTypeIdValid, expenseCtaCodeValid, invoiceDateValid, dueDateValid, subtotalValid, discountValid, taxValid, totalValid } = formValidation;

  return (
    <>
      <fieldset disabled={processed} className="border-0 p-0 m-0" style={{ minWidth: 0 }}>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.fuelPurchases.title.invoiceDetail">
            <Row>
              <Colxx xxs="12" sm="8" lg="7">
                <Row>
                  <Colxx xxs="12" xl="6">
                    <SearchSelect
                      label='page.fuelPurchases.label.documentRequired'
                      name='documentTypeId'
                      inputValue={documentTypeId}
                      options={listDocuments}
                      onChange={onInputChange}
                      invalid={sendForm && !!documentTypeIdValid}
                      feedbackText={sendForm && (documentTypeIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xl="6">
                    <SearchSelect
                      label='page.fuelPurchases.label.providerRequired'
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
                      name="invoiceNumber"
                      label='page.fuelPurchases.label.numInvoiceRequired'
                      value={invoiceNumber}
                      onChange={onInputChange}
                      type="text"
                      mask="***-***-**-********"
                      maskChar=" "
                      maxLength={20}
                      // tag={ReactInputMask}
                      invalid={sendForm && !!invoiceNumberValid}
                      feedbackText={sendForm && (invoiceNumberValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xl="6">
                    <SearchSelect
                      label='page.fuelPurchases.label.paymentMethodRequired'
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
                      label='page.fuelPurchases.label.accountRequired'
                      name='expenseCtaCode'
                      inputValue={expenseCtaCode}
                      options={listAccounts}
                      onChange={onInputChange}
                      invalid={sendForm && !!expenseCtaCodeValid}
                      feedbackText={sendForm && (expenseCtaCodeValid || null)}
                    />
                  </Colxx>
                </Row>
              </Colxx>
              <Colxx xxs="12" sm="4" lg="5">
                <Row>
                  <Colxx xxs="12" xs="6" sm="12" lg="6">
                    <DateCalendar
                      name="invoiceDate"
                      label="page.fuelPurchases.label.dateInvoiceRequired"
                      value={invoiceDate}
                      onChange={onInputChange}
                      invalid={sendForm && !!invoiceDateValid}
                      feedbackText={sendForm && (invoiceDateValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6">
                    <DateCalendar
                      name="dueDate"
                      label="page.fuelPurchases.label.dateExpirationRequired"
                      value={dueDate}
                      onChange={onInputChange}
                      invalid={sendForm && !!dueDateValid}
                      feedbackText={sendForm && (dueDateValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="subtotal"
                      label='input.subtotal'
                      value={subtotal}
                      onChange={onSubtotalChange}
                      type="text"
                      invalid={sendForm && !!subtotalValid}
                      feedbackText={sendForm && (subtotalValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="discount"
                      label='input.discount'
                      value={discount}
                      onChange={onDiscountChange}
                      type="text"
                      invalid={sendForm && !!discountValid}
                      feedbackText={sendForm && (discountValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="tax"
                      label='input.tax'
                      value={tax}
                      onChange={onTaxChange}
                      type="text"
                      invalid={sendForm && !!taxValid}
                      feedbackText={sendForm && (taxValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="12" lg="6" xl="4">
                    <InputField
                      name="total"
                      label='input.total'
                      value={total}
                      onChange={onInputChange}
                      type="text"
                      disabled
                      invalid={sendForm && !!totalValid}
                      feedbackText={sendForm && (totalValid || null)}
                    />
                  </Colxx>
                </Row>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
      </fieldset>
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