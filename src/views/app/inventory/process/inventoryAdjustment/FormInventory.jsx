import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { SimpleSelect } from '@/components/simpleSelect'
import { InputField } from '@/components/inputFields'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'

const FormInventory = ({documentId, documentCode, sourceStoreId, date, applyId, listDocuments, listStores, listTypeApply, onInputChange, sendForm, formValidation}) => {

  const {documentCodeValid, storeIdValid, applyIdValid} = formValidation;

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
              invalid={sendForm && !!storeIdValid}
              feedbackText={sendForm && (storeIdValid || null)}
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
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" xxl="6">
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
  )
}

export default FormInventory