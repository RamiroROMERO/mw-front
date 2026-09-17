import { Button, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import Modal from "@Components/modal";
import { InputField } from '@Components/inputFields'
import { SimpleSelect } from '@Components/simpleSelect'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { IntlMessages } from '@Helpers/Utils'
import { useFormRequisition } from './useFormRequisition'
import ModalApplyAccount from './ModalApplyAccount'

const FormRequisitions = ({idProd, documentCode, documentId, sourceStoreId, noCtaOrigin, assignStoreId, noCtaAssign, date, code, applyTo, onInputChange, listDocuments, listStores, listDestinations, listTypeApply, formValidation, sendForm, listAccounts, onBulkForm, requisitionDetail, setRequisitionDetail, onResetFormDeta, disabled, isProcessed, isVoided, pdaNumber}) => {

  const {documentCodeValid, sourceStoreIdValid, assignStoreIdValid, applyToValid} = formValidation;

  const {fnApplyDestinyAccount, onStoreChange, onDestinationChange, onApplyToChange, openModalApplyAccount, setOpenModalApplyAccount, fnApplyAll, fnApplyCurrent} = useFormRequisition({onBulkForm, listStores, listDestinations, requisitionDetail, setRequisitionDetail, noCtaAssign, idProd, onResetFormDeta});

  const propsToModalApplyAccount = {
    ModalContent: ModalApplyAccount,
    title: "modal.confirm.title",
    open: openModalApplyAccount,
    setOpen: setOpenModalApplyAccount,
    maxWidth: 'md',
    data:{
      fnApplyAll,
      fnApplyCurrent
    }
  }

  return (
    <>
    <Row>
      <Colxx className="order-xs-2 order-sm-1" xxs="12" sm="8" lg="9">
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
                    name='noCtaOrigin'
                    inputValue={noCtaOrigin}
                    options={listAccounts}
                    onChange={onInputChange}
                    isDisabled
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
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
                    name='noCtaAssign'
                    inputValue={noCtaAssign}
                    options={listAccounts}
                    onChange={onInputChange}
                    isDisabled={disabled}
                  />
                </Colxx>
                <Colxx xxs="12" align="right">
                  <Button color="secondary" onClick={() => {fnApplyDestinyAccount()}} disabled={disabled}>
                    <i className='bi bi-check' /> {IntlMessages("button.apply")}
                  </Button>
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Colxx>
      <Colxx className="order-xs-1 order-sm-2" xxs="12" sm="4" lg="3">
        <Row>
          <Colxx xxs="12" xs="6" sm="12">
            <DateCalendar
              name="date"
              label='select.date'
              value={date}
              onChange={onInputChange}
              disabled={disabled}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12">
            <InputField
              name="code"
              label='page.transfersToStores.input.numPhysical'
              value={code}
              onChange={onInputChange}
              type="text"
              disabled={disabled}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12">
            <SimpleSelect
              value={applyTo}
              name="applyTo"
              onChange={(e) => onApplyToChange(e, assignStoreId)}
              label="page.requisitions.select.applyId"
              options={listTypeApply}
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
    <Modal {...propsToModalApplyAccount}/>
    </>
  )
}

export default FormRequisitions
