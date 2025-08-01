import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import { InputField } from '@/components/inputFields'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { useFormTransfers } from './useFormTransfers'

const FormTransfers = ({documentId, documentCode, sourceStoreId, noCtaOrigin, assignStoreId, noCtaAssign, date, code, listDocuments, listStores, onInputChange, formValidation, sendForm, listAccounts, onBulkForm}) => {

  const {documentCodeValid, sourceStoreIdValid, assignStoreIdValid} = formValidation;

  const {onStoreChange, onDestinationChange} = useFormTransfers({onBulkForm, listStores});

  return (
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
                    options={listStores}
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
        </Row>
      </Colxx>
    </Row>
  )
}

export default FormTransfers