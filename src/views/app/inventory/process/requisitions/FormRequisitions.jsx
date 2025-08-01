import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import Modal from "@/components/modal";
import { InputField } from '@/components/inputFields'
import { SimpleSelect } from '@/components/simpleSelect'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { IntlMessages } from '@/helpers/Utils'
import { useFormRequisition } from './useFormRequisition'
import ModalApplyAccount from './ModalApplyAccount'

const FormRequisitions = ({idProd, documentCode, documentId, sourceStoreId, noCtaOrigin, assignStoreId, noCtaAssign, date, code, applyId, onInputChange, listDocuments, listStores, listDestinations, listTypeApply, formValidation, sendForm, listAccounts, onBulkForm, requisitionDetail, onResetFormDeta}) => {

  const {documentCodeValid, sourceStoreIdValid, assignStoreIdValid, applyIdValid} = formValidation;

  const {fnApplyDestinyAccount, onStoreChange, onDestinationChange, openModalApplyAccount, setOpenModalApplyAccount, fnApplyAll, fnApplyCurrent} = useFormRequisition({onBulkForm, listStores, listDestinations, requisitionDetail, noCtaAssign, idProd, onResetFormDeta});

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
                    onChange={onDestinationChange}
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
                  />
                </Colxx>
                <Colxx xxs="12" align="right">
                  <Button color="secondary" onClick={() => {fnApplyDestinyAccount()}}>
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
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12">
            <InputField
              name="code"
              label='page.transfersToStores.input.numPhysical'
              value={code}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12">
            <SimpleSelect
              value={applyId}
              name="applyId"
              onChange={onInputChange}
              label="page.requisitions.select.applyId"
              options={listTypeApply}
              invalid={sendForm && !!applyIdValid}
              feedbackText={sendForm && (applyIdValid || null)}
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
    <Modal {...propsToModalApplyAccount}/>
    </>
  )
}

export default FormRequisitions