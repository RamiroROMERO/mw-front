import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { SimpleSelect } from '@Components/simpleSelect'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { IntlMessages } from '@Helpers/Utils'

const APPLY_TO_OPTIONS = [
  { id: 'Inventario', name: 'Inventario' },
  { id: 'Costo', name: 'Costo' },
  { id: 'Gasto', name: 'Gasto' }
]

const FormInventory = ({documentId, documentCode, sourceStoreId, date, applyTo, listDocuments, listStores, onInputChange, sendForm, formValidation, disabled, isProcessed, isVoided, pdaNumber}) => {

  const {documentCodeValid, sourceStoreIdValid, applyToValid} = formValidation;

  return (
    <Row>
      <Colxx className="order-xs-2 order-sm-1" xxs="12" sm="8">
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
            <InputField
              label="input.documentId"
              name="documentId"
              value={documentId}
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xl="9">
            <SearchSelect
              label='select.storeId'
              name='sourceStoreId'
              inputValue={sourceStoreId}
              options={listStores}
              onChange={onInputChange}
              isDisabled={disabled}
              invalid={sendForm && !!sourceStoreIdValid}
              feedbackText={sendForm && (sourceStoreIdValid || null)}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx className="order-xs-1 order-sm-2" xxs="12" sm="4">
        <Row>
          <Colxx xxs="12" xs="6" sm="12" xxl="6">
            <DateCalendar
              name="date"
              label='select.date'
              value={date}
              onChange={onInputChange}
              disabled={disabled}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" xxl="6">
            <SimpleSelect
              value={applyTo}
              name="applyTo"
              onChange={onInputChange}
              label="page.requisitions.select.applyId"
              options={APPLY_TO_OPTIONS}
              disabled={disabled}
              invalid={sendForm && !!applyToValid}
              feedbackText={sendForm && (applyToValid || null)}
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
  )
}

export default FormInventory
