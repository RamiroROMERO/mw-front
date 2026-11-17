import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { RadioGroup } from '@Components/radioGroup'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { localToday, MAX } from './refundRules'

const APPLY_TO_OPTIONS = [
  { id: 'Inventario', name: 'Inventario' },
  { id: 'Costo', name: 'Costo' },
  { id: 'Gasto', name: 'Gasto' }
]

// Ingreso y Reintegros (SPEC v2-53-sr): el tipo decide qué campos se ven. A proveedor: proveedor y vencimiento. A almacén: destino y
// "Aplicar a". Las cuentas de este formulario son solo informativas (el back calcula las de cada línea).
const FormRefunds = ({
  documentCode, documentId, sourceStoreId, originCtaCode, assignStoreId, assignCtaCode, providerId, date, physicalNumber, applyTo, expirationDate,
  reintType, senderName, receiverName, listDocuments, listStores, listDestinations, listAccounts, providerSelectOptions, onInputChange,
  onStoreChange, onDestinationChange, onApplyToChange, onProviderChange, onProviderSearch, onTypeChange, isProviderMode, isStoreMode,
  sendForm, formValidation, disabled, isProcessed, isVoided, pdaNumber
}) => {
  const {
    documentCodeValid, sourceStoreIdValid, assignStoreIdValid, providerIdValid, expirationDateValid, applyToValid, dateValid,
    physicalNumberValid, senderNameValid, receiverNameValid
  } = formValidation;

  return (
    <Row>
      <Colxx className="order-xs-2 order-sm-1" xxs="12" sm="8" xl="7">
        <Row>
          <Colxx xxs="12" md="8" xl="9">
            <SearchSelect
              label='select.documentCode'
              name='documentCode'
              inputValue={documentCode}
              options={listDocuments}
              onChange={onInputChange}
              isDisabled={disabled}
              invalid={sendForm && !!documentCodeValid}
              feedbackText={sendForm && (documentCodeValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="4" xl="3">
            <InputField label="input.documentId" name="documentId" value={documentId} disabled />
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="select.storeId">
              <Row>
                <Colxx xxs="12" lg="5">
                  <SearchSelect
                    label='select.storeId'
                    name='sourceStoreId'
                    inputValue={sourceStoreId}
                    options={listStores}
                    onChange={onStoreChange}
                    isDisabled={disabled}
                    invalid={sendForm && !!sourceStoreIdValid}
                    feedbackText={sendForm && (sourceStoreIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" lg="7">
                  <SearchSelect
                    label='select.accountId'
                    name='originCtaCode'
                    inputValue={originCtaCode}
                    options={listAccounts}
                    onChange={onInputChange}
                    isDisabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          {isProviderMode && (
            <Colxx xxs="12">
              <ContainerWithLabel label="select.providerId">
                <Row>
                  <Colxx xxs="12">
                    <SearchSelect
                      label="select.providerId"
                      name="providerId"
                      inputValue={providerId}
                      options={providerSelectOptions}
                      onInputChange={onProviderSearch}
                      onChange={onProviderChange}
                      isDisabled={disabled}
                      invalid={sendForm && !!providerIdValid}
                      feedbackText={sendForm && (providerIdValid || null)}
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          )}
          {isStoreMode && (
            <Colxx xxs="12">
              <ContainerWithLabel label="select.destinationId">
                <Row>
                  <Colxx xxs="12" lg="5">
                    <SearchSelect
                      label="select.destinationId"
                      name="assignStoreId"
                      inputValue={assignStoreId}
                      options={listDestinations}
                      onChange={(e) => onDestinationChange(e, applyTo)}
                      isDisabled={disabled}
                      invalid={sendForm && !!assignStoreIdValid}
                      feedbackText={sendForm && (assignStoreIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" lg="7">
                    <SearchSelect
                      label='select.accountId'
                      name='assignCtaCode'
                      inputValue={assignCtaCode}
                      options={listAccounts}
                      onChange={onInputChange}
                      isDisabled
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          )}
          <Colxx xxs="12" md="6">
            <InputField
              name="senderName"
              label="page.transfersToStores.input.senderName"
              value={senderName}
              onChange={onInputChange}
              type="text"
              maxLength={MAX.senderName}
              disabled={disabled}
              invalid={sendForm && !!senderNameValid}
              feedbackText={sendForm && (senderNameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField
              name="receiverName"
              label="page.transfersToStores.input.receiverName"
              value={receiverName}
              onChange={onInputChange}
              type="text"
              maxLength={MAX.receiverName}
              disabled={disabled}
              invalid={sendForm && !!receiverNameValid}
              feedbackText={sendForm && (receiverNameValid || null)}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx className="order-xs-1 order-sm-2" xxs="12" sm="4" xl="5">
        <Row>
          <Colxx xxs="12" xs="6" sm="12" xl="7">
            <Row>
              <Colxx xxs="12">
                <DateCalendar
                  name="date"
                  label='select.date'
                  value={date}
                  onChange={onInputChange}
                  disabled={disabled}
                  maxDate={localToday()}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && (dateValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="physicalNumber"
                  label='page.transfersToStores.input.numPhysical'
                  value={physicalNumber}
                  onChange={onInputChange}
                  type="text"
                  disabled={disabled}
                  invalid={sendForm && !!physicalNumberValid}
                  feedbackText={sendForm && (physicalNumberValid || null)}
                />
              </Colxx>
              {isStoreMode && (
                <Colxx xxs="12">
                  <SimpleSelect
                    value={applyTo}
                    name="applyTo"
                    onChange={(e) => onApplyToChange(e, assignStoreId)}
                    label="page.requisitions.select.applyId"
                    options={APPLY_TO_OPTIONS}
                    disabled={disabled}
                    invalid={sendForm && !!applyToValid}
                    feedbackText={sendForm && (applyToValid || null)}
                  />
                </Colxx>
              )}
              {isProviderMode && (
                <Colxx xxs="12">
                  <DateCalendar
                    name="expirationDate"
                    label='select.dateExpiration'
                    value={expirationDate}
                    onChange={onInputChange}
                    disabled={disabled}
                    invalid={sendForm && !!expirationDateValid}
                    feedbackText={sendForm && (expirationDateValid || null)}
                  />
                </Colxx>
              )}
            </Row>
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" xl="5">
            <Row>
              <Colxx xxs="12">
                <RadioGroup
                  label="page.refund.radio.title.type"
                  name="reintType"
                  value={reintType}
                  onChange={onTypeChange}
                  options={
                    [
                      { id: 1, label: "page.refund.radio.purchase", disabled },
                      { id: 2, label: "page.refund.radio.refund", disabled }
                    ]
                  }
                />
              </Colxx>
              {isVoided && (
                <Colxx xxs="12">
                  <span className="text-danger fw-bold">
                    <i className="bi bi-x-octagon-fill" /> {IntlMessages("page.creditNotesProv.status.voided")}
                  </span>
                </Colxx>
              )}
              {!isVoided && isProcessed && (
                <Colxx xxs="12">
                  <span className="text-success">
                    <i className="bi bi-check-circle-fill" /> {IntlMessages("page.creditNotesProv.status.processed")} #{pdaNumber}
                  </span>
                </Colxx>
              )}
            </Row>
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FormRefunds
