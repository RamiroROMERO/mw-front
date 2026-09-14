import { Row, Form } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { TYPE_ADJUSTMENT } from './useDebitNotes';

const DebitNoteForm = (props) => {
  const {
    documentCode, documentId, numberCAI, date, clientId, clientRtn, clientName, typeId, typeOther, name,
    valueLps, docValueUSD, exchangeRate, accCode, currenId, pdaNumber,
    listTypeDocuments, listCustomers, listAccounts,
    onInputChange, onCustomerChange, onTypeChange,
    formValidation, sendForm, disabled, isVoided
  } = props;

  const { documentCodeValid, clientIdValid } = formValidation;
  const isAdjustment = typeId === TYPE_ADJUSTMENT;

  return (
    <Form>
      <Row>
        <Colxx xxs="12" xs="12" sm="8" md="8" lg="5">
          <Row>
            <Colxx xxs="12">
              <SimpleSelect
                name="documentCode"
                label="page.custDebitNotes.select.typeDocument"
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
                label="page.custDebitNotes.input.internalNumber"
              />
            </Colxx>
            <Colxx xxs="8">
              <InputField
                value={numberCAI}
                name="numberCAI"
                type="text"
                disabled
                label="page.custDebitNotes.input.fiscalNumber"
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="page.custDebitNotes.title.customer">
                <SearchSelect
                  label="page.custDebitNotes.select.clientId"
                  name="clientId"
                  inputValue={clientId}
                  onChange={onCustomerChange}
                  options={listCustomers}
                  isDisabled={disabled}
                  invalid={sendForm && !!clientIdValid}
                  feedbackText={sendForm && (clientIdValid || null)}
                />
                <Row>
                  <Colxx xxs="5">
                    <InputField value={clientRtn} name="clientRtn" type="text" disabled label="page.custDebitNotes.input.clientRtn" />
                  </Colxx>
                  <Colxx xxs="7">
                    <InputField value={clientName} name="clientName" type="text" disabled label="page.custDebitNotes.input.clientName" />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              <InputField
                value={name}
                name="name"
                onChange={onInputChange}
                type="textarea"
                label="page.custDebitNotes.input.concept"
                disabled={disabled}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="4" md="4" lg="3">
          <Row>
            <Colxx xxs="12">
              <RadioGroup
                label="page.custDebitNotes.title.type"
                name="typeId"
                value={typeId}
                onChange={onTypeChange}
                options={[
                  { id: 1, label: "page.custDebitNotes.radio.lateFee", disabled },
                  { id: 2, label: "page.custDebitNotes.radio.otherCharge", disabled },
                  { id: 3, label: "page.custDebitNotes.radio.adjustment", disabled },
                  { id: 4, label: "page.custDebitNotes.radio.other", disabled }
                ]}
              />
            </Colxx>
            {typeId === 4 && (
              <Colxx xxs="12">
                <InputField
                  name="typeOther"
                  label="page.custDebitNotes.input.specifyOther"
                  value={typeOther}
                  onChange={onInputChange}
                  type="text"
                  disabled={disabled}
                />
              </Colxx>
            )}
            {!isAdjustment && (
              <Colxx xxs="12">
                <SimpleSelect
                  name="accCode"
                  label="page.custDebitNotes.select.account"
                  value={accCode}
                  onChange={onInputChange}
                  options={listAccounts}
                  disabled={disabled}
                />
              </Colxx>
            )}
            <Colxx xxs="12">
              <RadioGroup
                label="page.custDebitNotes.title.currency"
                name="currenId"
                value={currenId}
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
                label="page.custDebitNotes.input.date"
                onChange={onInputChange}
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="6">
              <InputField
                value={valueLps}
                name="valueLps"
                type="text"
                disabled
                label="page.custDebitNotes.input.valueLps"
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="6">
              <InputField
                value={docValueUSD}
                name="docValueUSD"
                onChange={onInputChange}
                type="text"
                disabled={disabled}
                label="page.custDebitNotes.input.valueUsd"
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="12">
              <InputField
                value={exchangeRate}
                name="exchangeRate"
                onChange={onInputChange}
                type="text"
                disabled={disabled}
                label="page.custDebitNotes.input.exchangeRate"
              />
            </Colxx>
            {isVoided && (
              <Colxx xxs="12">
                <span className="text-danger fw-bold">
                  <i className="bi bi-x-octagon-fill" /> {IntlMessages("page.custDebitNotes.status.voided")}
                </span>
              </Colxx>
            )}
            {!isVoided && pdaNumber > 0 && (
              <Colxx xxs="12">
                <span className="text-success">
                  <i className="bi bi-check-circle-fill" /> {IntlMessages("page.custDebitNotes.status.processed")} #{pdaNumber}
                </span>
              </Colxx>
            )}
          </Row>
        </Colxx>
      </Row>
    </Form>
  )
}
export default DebitNoteForm;
