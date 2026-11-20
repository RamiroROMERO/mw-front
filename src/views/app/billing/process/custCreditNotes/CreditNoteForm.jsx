import { Row, Form } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { TYPE_OTHER, TYPE_RETURN } from './useCreditNotes';

const CreditNoteForm = (props) => {
  const {
    documentCode, documentId, numberCAI, date, customerId, clientRtn, clientName, typeId, typeOther, description,
    valueLps, valueUsd, exchangeRate, incomeCtaCode, currencyId, pdaNumber,
    listTypeDocuments, listCustomers, listAccounts,
    onInputChange, onCustomerChange, onTypeChange,
    formValidation, sendForm, disabled, isVoided
  } = props;

  const { documentCodeValid, customerIdValid } = formValidation;
  const isReturn = typeId === TYPE_RETURN;
  // IntlMessages es un hook: se piden aquí arriba, no dentro de una condición (orden de hooks).
  const textVoided = IntlMessages('page.custCreditNotes.status.voided');
  const textProcessed = IntlMessages('page.custCreditNotes.status.processed');

  return (
    <Form>
      <Row>
        <Colxx xxs="12" xs="12" sm="8" md="8" lg="5">
          <Row>
            <Colxx xxs="12">
              <SimpleSelect
                name="documentCode"
                label="page.custCreditNotes.select.typeDocument"
                value={documentCode}
                onChange={onInputChange}
                options={listTypeDocuments}
                disabled={disabled}
                invalid={sendForm && !!documentCodeValid}
                feedbackText={sendForm && (documentCodeValid || null)}
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="4">
              <InputField
                value={documentId || ''}
                name="documentId"
                type="text"
                disabled
                label="page.custCreditNotes.input.internalNumber"
              />
            </Colxx>
            <Colxx xxs="8">
              <InputField
                value={numberCAI}
                name="numberCAI"
                type="text"
                disabled
                label="page.custCreditNotes.input.fiscalNumber"
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="page.custCreditNotes.title.customer">
                <SearchSelect
                  label="page.custCreditNotes.select.clientId"
                  name="customerId"
                  inputValue={customerId}
                  onChange={onCustomerChange}
                  options={listCustomers}
                  isDisabled={disabled}
                  invalid={sendForm && !!customerIdValid}
                  feedbackText={sendForm && (customerIdValid || null)}
                />
                <Row>
                  <Colxx xxs="5">
                    <InputField value={clientRtn} name="clientRtn" type="text" disabled label="page.custCreditNotes.input.clientRtn" />
                  </Colxx>
                  <Colxx xxs="7">
                    <InputField value={clientName} name="clientName" type="text" disabled label="page.custCreditNotes.input.clientName" />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              <InputField
                value={description}
                name="description"
                onChange={onInputChange}
                type="textarea"
                label="page.custCreditNotes.input.concept"
                disabled={disabled}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="4" md="4" lg="3">
          <Row>
            <Colxx xxs="12">
              <RadioGroup
                label="page.custCreditNotes.title.type"
                name="typeId"
                value={typeId}
                onChange={onTypeChange}
                options={[
                  { id: 1, label: "page.custCreditNotes.radio.discount", disabled },
                  { id: 2, label: "page.custCreditNotes.radio.cancellation", disabled },
                  { id: 3, label: "page.custCreditNotes.radio.return", disabled },
                  { id: 4, label: "page.custCreditNotes.radio.other", disabled }
                ]}
              />
            </Colxx>
            {typeId === TYPE_OTHER && (
              <Colxx xxs="12">
                <InputField
                  name="typeOther"
                  label="page.custCreditNotes.input.specifyOther"
                  value={typeOther}
                  onChange={onInputChange}
                  type="text"
                  disabled={disabled}
                />
              </Colxx>
            )}
            {!isReturn && (
              <Colxx xxs="12">
                <SimpleSelect
                  name="incomeCtaCode"
                  label="page.custCreditNotes.select.account"
                  value={incomeCtaCode}
                  onChange={onInputChange}
                  options={listAccounts}
                  disabled={disabled}
                />
              </Colxx>
            )}
            <Colxx xxs="12">
              <RadioGroup
                label="page.custCreditNotes.title.currency"
                name="currencyId"
                value={currencyId}
                onChange={onInputChange}
                options={[
                  { id: 1, label: "page.invoicing.radio.lempira" },
                  { id: 2, label: "page.invoicing.radio.dollar" }
                ]}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Row>
            <Colxx xxs="12" sm="6" md="6" lg="12">
              <DateCalendar
                value={date}
                disabled={disabled}
                name="date"
                label="page.custCreditNotes.input.date"
                onChange={onInputChange}
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="6">
              <InputField
                value={valueLps}
                name="valueLps"
                type="text"
                disabled
                label="page.custCreditNotes.input.valueLps"
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="6">
              <InputField
                value={valueUsd}
                name="valueUsd"
                type="text"
                disabled
                label="page.custCreditNotes.input.valueUsd"
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="12">
              <InputField
                value={exchangeRate}
                name="exchangeRate"
                onChange={onInputChange}
                type="text"
                disabled={disabled}
                label="page.custCreditNotes.input.exchangeRate"
              />
            </Colxx>
            {isVoided && (
              <Colxx xxs="12">
                <span className="text-danger fw-bold">
                  <i className="bi bi-x-octagon-fill" /> {textVoided}
                </span>
              </Colxx>
            )}
            {!isVoided && pdaNumber > 0 && (
              <Colxx xxs="12">
                <span className="text-success">
                  <i className="bi bi-check-circle-fill" /> {textProcessed} #{pdaNumber}
                </span>
              </Colxx>
            )}
          </Row>
        </Colxx>
      </Row>
    </Form>
  )
}
export default CreditNoteForm;
