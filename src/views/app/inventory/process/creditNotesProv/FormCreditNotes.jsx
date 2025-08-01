import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { RadioGroup } from '@/components/radioGroup'
import DateCalendar from '@/components/dateCalendar'
import { useFormCredit } from './useFormCredit'

const FormCreditNotes = ({documentId, providerId, providerCode, providerRtn, providerName, concept, specifyOther, notes, date, valueLps, valueUsd, exchangeRate, listDocuments, listProviders, onInputChange, onBulkForm, setShowDetail1, setShowDetail2,     setCreditNotesDetail, setCreditNotesDetail2, showspecify, setShowSpecify, sendForm, formValidation}) => {

  const {onConceptChange, onProviderChange} = useFormCredit({onBulkForm, setShowDetail1, setShowDetail2, setCreditNotesDetail, setCreditNotesDetail2, listProviders, setShowSpecify});

  const {documentIdValid, valueLpsValid, providerIdValid} = formValidation;

  return (
    <Row>
      <Colxx className="order-xs-2 order-sm-1" xxs="12" sm="8" lg="9">
        <Row>
          <Colxx className="order-xs-2 order-lg-1" xxs="12" lg="5">
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  label='select.documentId'
                  name='documentId'
                  inputValue={documentId}
                  options={listDocuments}
                  onChange={onInputChange}
                  invalid={sendForm && !!documentIdValid}
                  feedbackText={sendForm && (documentIdValid || null)}
                />
              </Colxx>
              <Colxx xxs="12">
                <RadioGroup
                  label="page.creditNotesProv.radio.concept"
                  name="concept"
                  value={concept}
                  onChange={onConceptChange}
                  options={[
                    {id:1, label: 'page.creditNotesProv.radio.discount'},
                    {id:2, label: 'page.creditNotesProv.radio.cancellation'},
                    {id:3, label: 'page.creditNotesProv.radio.devolution'},
                    {id:4, label: 'page.creditNotesProv.radio.others'}
                  ]}
                  display="flex"
                />
              </Colxx>
              <Colxx xxs="12" style={{display: showspecify}}>
                <InputField
                  name="specifyOther"
                  label='page.creditNotesProv.input.specifyOther'
                  value={specifyOther}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx className="order-xs-1 order-lg-2" xxs="12" lg="7">
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="label.title.provider">
                  <Row>
                    <Colxx xxs="12">
                      <SearchSelect
                        label='select.providerId'
                        name='providerId'
                        inputValue={providerId}
                        options={listProviders}
                        onChange={onProviderChange}
                        invalid={sendForm && !!providerIdValid}
                        feedbackText={sendForm && (providerIdValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" xs="4" lg="12" xl="5">
                      <InputField
                        name="providerCode"
                        label='input.code'
                        value={providerCode}
                        onChange={onInputChange}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs="12" xs="8" lg="12" xl="7">
                      <InputField
                        name="providerRtn"
                        label='input.rtn'
                        value={providerRtn}
                        onChange={onInputChange}
                        type="text"
                      />
                    </Colxx>
                    <Colxx xxs="12" lg="12">
                      <InputField
                        name="providerName"
                        label='input.name'
                        value={providerName}
                        onChange={onInputChange}
                        type="text"
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="notes"
              label='input.observations'
              value={notes}
              onChange={onInputChange}
              type="textarea"
            />
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
              name="valueLps"
              label='page.creditNotesProv.input.valueLps'
              value={valueLps}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!valueLpsValid}
              feedbackText={sendForm && (valueLpsValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12">
            <InputField
              name="valueUsd"
              label='page.creditNotesProv.input.valueUsd'
              value={valueUsd}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12">
            <InputField
              name="exchangeRate"
              label='page.creditNotesProv.input.exchangeRate'
              value={exchangeRate}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default FormCreditNotes