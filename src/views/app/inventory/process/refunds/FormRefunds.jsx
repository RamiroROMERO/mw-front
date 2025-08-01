import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { IntlMessages } from '@/helpers/Utils'
import { InputField } from '@/components/inputFields'
import { SimpleSelect } from '@/components/simpleSelect'
import { RadioGroup } from '@/components/radioGroup'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import Modal from "@/components/modal";
import { useFormRefund } from './useFormRefund'
import ModalApplyAccount from '../requisitions/ModalApplyAccount'

const FormRefunds = ({documentCode, documentId, sourceStoreId, noCtaOrigin, assignStoreId, noCtaAssign, providerId, date, code, applyId, expirationDate, reintType, listDocuments, listStores, listDestinations, listAccounts, listProviders, listTypeApply, onInputChange, showType1, showType2, setShowType1, setShowType2, onBulkForm, refundDetail, idProd, onResetFormDeta, sendForm, formValidation}) => {

  const {onStoreChange, onDestinationChange, onTypeChange, fnApplyDestinyAccount, openModalApplyAccount, setOpenModalApplyAccount, fnApplyAll, fnApplyCurrent} = useFormRefund({onBulkForm, listStores, listDestinations, refundDetail, noCtaAssign, idProd, onResetFormDeta, setShowType1, setShowType2});

  const {documentCodeValid, sourceStoreIdValid} = formValidation;

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
      <Colxx className="order-xs-2 order-sm-1" xxs="12" sm="8" xl="7">
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
                <Colxx xxs="12" lg="5" style={{display: showType2}}>
                  <SearchSelect
                    label="select.destinationId"
                    name="assignStoreId"
                    inputValue={assignStoreId}
                    options={listDestinations}
                    onChange={onDestinationChange}
                    // invalid={sendForm && !!destinationIdValid}
                    // feedbackText={sendForm && (destinationIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" lg="7" style={{display: showType2}}>
                  <SearchSelect
                    label='select.accountId'
                    name='noCtaAssign'
                    inputValue={noCtaAssign}
                    options={listAccounts}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" style={{display: showType1}}>
                  <SearchSelect
                    label="select.providerId"
                    name="providerId"
                    inputValue={providerId}
                    options={listProviders}
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
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="code"
                  label='page.transfersToStores.input.numPhysical'
                  value={code}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12" style={{display: showType2}}>
                <SimpleSelect
                  value={applyId}
                  name="applyId"
                  onChange={onInputChange}
                  label="page.requisitions.select.applyId"
                  options={listTypeApply}
                />
              </Colxx>
              <Colxx xxs="12" style={{display: showType1}}>
                <DateCalendar
                  name="expirationDate"
                  label='select.dateExpiration'
                  value={expirationDate}
                  onChange={onInputChange}
                />
              </Colxx>
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
                      {id:1, label:"page.refund.radio.purchase"},
                      {id:2, label:"page.refund.radio.refund"}
                    ]
                  }
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
      </Colxx>
    </Row>
    <Modal {...propsToModalApplyAccount}/>
    </>
  )
}

export default FormRefunds