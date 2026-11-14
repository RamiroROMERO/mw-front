import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { localToday } from './ticketPurchaseRules'

// Cabecera de la boleta. Obligatorios (marcados con *): documento, proveedor, forma de pago y fecha (no futura), igual que el DTO del back.
// Una boleta guardada no cambia de tipo de documento (el legacy deshabilita el combo al abrirla) y una contabilizada no se modifica.
const FormTicket = ({ id, documentCode, documentId, providerId, paymentTypeId, date, purchaseOrderId, listDocuments, listProviders, listPaymentTypes, onInputChange, sendForm, formValidation, processed }) => {

  const { documentCodeValid, dateValid, providerIdValid, paymentTypeIdValid } = formValidation;
  const maxDate = new Date(`${localToday()}T12:00:00`);

  return (
    <Row>
      <Colxx xxs="12" sm="8" lg="9" xl="10">
        <Row>
          <Colxx xxs="12" lg="6" xl="4">
            <SearchSelect
              label='page.ticketPurchase.label.documentRequired'
              name='documentCode'
              inputValue={documentCode}
              options={listDocuments}
              onChange={onInputChange}
              isDisabled={processed || Number(id) > 0}
              invalid={sendForm && !!documentCodeValid}
              feedbackText={sendForm && (documentCodeValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" lg="6" xl="5">
            <SearchSelect
              label='page.ticketPurchase.label.providerRequired'
              name='providerId'
              inputValue={providerId}
              options={listProviders}
              onChange={onInputChange}
              isDisabled={processed}
              invalid={sendForm && !!providerIdValid}
              feedbackText={sendForm && (providerIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" lg="6" xl="3">
            <SearchSelect
              label='page.ticketPurchase.label.paymentRequired'
              name='paymentTypeId'
              inputValue={paymentTypeId}
              options={listPaymentTypes}
              onChange={onInputChange}
              isDisabled={processed}
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
              label="page.ticketPurchase.label.dateRequired"
              value={date}
              onChange={onInputChange}
              maxDate={maxDate}
              disabled={processed}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="5" sm="12">
            <InputField
              name="purchaseOrderId"
              label='input.purchaseOrder'
              value={purchaseOrderId}
              onChange={onInputChange}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" sm="12">
            <InputField
              name="documentId"
              label='pages.input.documentId'
              value={documentId}
              disabled
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FormTicket
