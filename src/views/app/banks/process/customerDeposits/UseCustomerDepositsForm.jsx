import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';

export const UseCustomerDepositsForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listDocto, listBanks, listCustomer, formValidationIndex, sendForm, isApplied } = props;

  const {
    date, documentCode, documentId, bankCode, bankAccountName, depositNumber, description,
    responsible, customerId, customerName, value, exchangeRate
  } = formStateIndex;

  const { dateValid, documentCodeValid, bankCodeValid, descriptionValid, customerIdValid } = formValidationIndex;

  return (
    <Row className='mb-3'>
      <Colxx xxs="12" sm="12" md="12" lg="8">
        <Row>
          <Colxx xxs="12" xs="7" md="8">
            <SearchSelect
              name="documentCode"
              inputValue={documentCode}
              onChange={onInputChangeIndex}
              label="input.document"
              options={listDocto}
              invalid={sendForm && !!documentCodeValid}
              feedbackText={sendForm && documentCodeValid || null}
              isDisabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="12" xs="5" md="4">
            <InputField
              name="documentId"
              value={documentId}
              onChange={onInputChangeIndex}
              label="page.variousDeposits.input.documentNumber"
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="7" md="8">
            <SearchSelect
              name="bankCode"
              inputValue={bankCode}
              onChange={onInputChangeIndex}
              label="select.bankCode"
              options={listBanks}
              invalid={sendForm && !!bankCodeValid}
              feedbackText={sendForm && bankCodeValid || null}
              isDisabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="12" xs="5" md="4">
            <InputField
              name="bankAccountName"
              value={bankAccountName}
              onChange={onInputChangeIndex}
              label="input.numberAccount"
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField
              name="depositNumber"
              value={depositNumber}
              onChange={onInputChangeIndex}
              label="page.customerDeposits.input.depositNumber"
              type="text"
              disabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField
              name="responsible"
              value={responsible}
              onChange={onInputChangeIndex}
              label="page.customerDeposits.input.responsible"
              type="text"
              disabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="description"
              value={description}
              onChange={onInputChangeIndex}
              label="page.variousDeposits.input.description"
              type="textarea"
              invalid={sendForm && !!descriptionValid}
              feedbackText={sendForm && descriptionValid || null}
              disabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="12" xs="8" md="9">
            <SearchSelect
              name="customerId"
              inputValue={customerId}
              onChange={onInputChangeIndex}
              label="page.variousDeposits.select.customer"
              options={listCustomer}
              invalid={sendForm && !!customerIdValid}
              feedbackText={sendForm && customerIdValid || null}
              isDisabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="12" xs="4" md="3">
            <InputField
              name="customerName"
              value={customerName}
              onChange={onInputChangeIndex}
              label="page.variousDeposits.input.customerName"
              type="text"
              disabled
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
        <Row>
          <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
            <DateCalendar
              name="date"
              value={date}
              onChange={onInputChangeIndex}
              label="select.date"
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && dateValid || null}
              disabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
            <InputField
              name="value"
              value={value}
              onChange={onInputChangeIndex}
              label="input.valueLps"
              type="text"
              disabled={isApplied}
            />
          </Colxx>
          <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
            <InputField
              name="exchangeRate"
              value={exchangeRate}
              onChange={onInputChangeIndex}
              label="input.rateExchange"
              type="text"
              disabled={isApplied}
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}
