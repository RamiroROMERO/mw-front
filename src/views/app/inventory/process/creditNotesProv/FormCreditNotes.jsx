import { Row, Form } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { TYPE_OTHER } from './useCreditNotes';

const FormCreditNotes = (props) => {
  const {
    documentCode, documentId, cai, numberCAI, date, providerId, providerRtn, providerName, typeId, typeOther, name,
    valueLps, docValueUSD, exchangeRate, currenId, pdaNumber, isMixed,
    listDocuments, listProviders,
    onInputChange, onProviderChange, onTypeChange,
    formValidation, sendForm, disabled, isVoided
  } = props;

  const { documentCodeValid, providerIdValid, caiValid, numberCAIValid } = formValidation;

  return (
    <Form>
      <Row>
        <Colxx xxs="12" xs="12" sm="8" md="8" lg="5">
          <Row>
            <Colxx xxs="12">
              <SimpleSelect
                name="documentCode"
                label="page.creditNotesProv.select.typeDocument"
                value={documentCode}
                onChange={onInputChange}
                options={listDocuments}
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
                label="page.creditNotesProv.input.internalNumber"
              />
            </Colxx>
            <Colxx xxs="4">
              <InputField
                value={cai}
                name="cai"
                type="text"
                onChange={onInputChange}
                disabled={disabled}
                label="page.creditNotesProv.input.fiscalNumber"
                invalid={sendForm && !!caiValid}
                feedbackText={sendForm && (caiValid || null)}
              />
            </Colxx>
            <Colxx xxs="4">
              <InputField
                value={numberCAI}
                name="numberCAI"
                type="text"
                onChange={onInputChange}
                disabled={disabled}
                label="page.creditNotesProv.input.numberCAI"
                invalid={sendForm && !!numberCAIValid}
                feedbackText={sendForm && (numberCAIValid || null)}
              />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs="12">
              <ContainerWithLabel label="label.title.provider">
                <SearchSelect
                  label="select.providerId"
                  name="providerId"
                  inputValue={providerId}
                  onChange={onProviderChange}
                  options={listProviders}
                  isDisabled={disabled}
                  invalid={sendForm && !!providerIdValid}
                  feedbackText={sendForm && (providerIdValid || null)}
                />
                <Row>
                  <Colxx xxs="5">
                    <InputField value={providerRtn} name="providerRtn" type="text" disabled label="input.rtn" />
                  </Colxx>
                  <Colxx xxs="7">
                    <InputField value={providerName} name="providerName" type="text" disabled label="input.name" />
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
                label="input.observations"
                disabled={disabled}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="4" md="4" lg="3">
          <Row>
            <Colxx xxs="12">
              <RadioGroup
                label="page.creditNotesProv.title.type"
                name="typeId"
                value={typeId}
                onChange={onTypeChange}
                options={[
                  { id: 1, label: 'page.creditNotesProv.radio.discount', disabled },
                  { id: 2, label: 'page.creditNotesProv.radio.cancellation', disabled },
                  { id: 3, label: 'page.creditNotesProv.radio.devolution', disabled },
                  { id: 4, label: 'page.creditNotesProv.radio.others', disabled }
                ]}
              />
            </Colxx>
            {typeId === TYPE_OTHER && (
              <Colxx xxs="12">
                <InputField
                  name="typeOther"
                  label="page.creditNotesProv.input.specifyOther"
                  value={typeOther}
                  onChange={onInputChange}
                  type="text"
                  disabled={disabled}
                />
              </Colxx>
            )}
            <Colxx xxs="12">
              <RadioGroup
                label="page.creditNotesProv.title.currency"
                name="currenId"
                value={currenId}
                onChange={onInputChange}
                options={[
                  { id: 1, label: 'page.invoicing.radio.lempira', disabled },
                  { id: 2, label: 'page.invoicing.radio.dollar', disabled }
                ]}
              />
            </Colxx>
            <Colxx xxs="12">
              <Checkbox
                onChange={onInputChange}
                type="checkbox"
                value={isMixed}
                name="isMixed"
                label="page.creditNotesProv.check.isMixed"
                disabled={disabled}
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
                label="select.date"
                onChange={onInputChange}
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="6">
              <InputField
                value={valueLps}
                name="valueLps"
                type="text"
                disabled
                label="page.creditNotesProv.input.valueLps"
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="6">
              <InputField
                value={docValueUSD}
                name="docValueUSD"
                onChange={onInputChange}
                type="text"
                disabled={disabled}
                label="page.creditNotesProv.input.valueUsd"
              />
            </Colxx>
            <Colxx xxs="12" sm="6" md="6" lg="12">
              <InputField
                value={exchangeRate}
                name="exchangeRate"
                onChange={onInputChange}
                type="text"
                disabled={disabled}
                label="page.creditNotesProv.input.exchangeRate"
              />
            </Colxx>
            {isVoided && (
              <Colxx xxs="12">
                <span className="text-danger fw-bold">
                  <i className="bi bi-x-octagon-fill" /> {IntlMessages("page.creditNotesProv.status.voided")}
                </span>
              </Colxx>
            )}
            {!isVoided && pdaNumber > 0 && (
              <Colxx xxs="12">
                <span className="text-success">
                  <i className="bi bi-check-circle-fill" /> {IntlMessages("page.creditNotesProv.status.processed")} #{pdaNumber}
                </span>
              </Colxx>
            )}
          </Row>
        </Colxx>
      </Row>
    </Form>
  )
}
export default FormCreditNotes;
