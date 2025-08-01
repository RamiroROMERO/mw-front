import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { SimpleSelect } from '@/components/simpleSelect';
import { InputField } from '@/components/inputFields';
import DateCalendar from '@/components/dateCalendar';
import { Checkbox } from '@/components/checkbox';
import { CardTitle } from 'reactstrap';

export const UseChecksForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listDocto, listBanks, listProvider, listCurrencyName, listCityName, formValidationIndex, sendForm } = props;

  const { id, documentId, bankCode, providerId, cantLetter, date, value, valueUsd, type, currencyName, cityId, requestId, status, numberCheck, document, numberAccount } = formStateIndex;

  const { documentIdValid, bankCodeValid, providerValid, currencyNameValid, typeValid, numberCheckValid, valueUsdValid } = formValidationIndex;

  return (
    <>
      <Row className='mb-3'>
        <Colxx xxs="12" sm="12" md="12" lg="8">
          <Row>
            <Colxx xss="12" xs="7" md="8">
              <SearchSelect
                name="documentId"
                inputValue={documentId}
                onChange={onInputChangeIndex}
                label="select.documentId"
                options={listDocto}
                invalid={sendForm && !!documentIdValid}
                feedbackText={sendForm && documentIdValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="document"
                value={document}
                onChange={onInputChangeIndex}
                label="input.document"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="7" md="8">
              <SearchSelect
                name="bankCode"
                inputValue={bankCode}
                onChange={onInputChangeIndex}
                label="select.bankCode"
                options={listBanks}
                invalid={sendForm && !!bankCodeValid}
                feedbackText={sendForm && bankCodeValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="numberAccount"
                value={numberAccount}
                onChange={onInputChangeIndex}
                label="input.numberAccount"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="7" md="8">
              <SearchSelect
                name="providerId"
                inputValue={providerId}
                onChange={onInputChangeIndex}
                label="page.checks.select.payOrder"
                options={listProvider}
                invalid={sendForm && !!providerValid}
                feedbackText={sendForm && providerValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="value"
                value={value}
                onChange={onInputChangeIndex}
                label="input.valueLps"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12" xs="7" md="8" >
              <InputField
                name="cantLetter"
                value={cantLetter}
                onChange={onInputChangeIndex}
                label="input.valueLetter"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="6" xs="5" md="4">
              <InputField
                name="valueUsd"
                value={valueUsd}
                onChange={onInputChangeIndex}
                label="input.valueUsd"
                type="text"
                invalid={sendForm && !!valueUsdValid}
                feedbackText={sendForm && valueUsdValid || null}
              />
            </Colxx>
            <Colxx xxs="6" xs="7" md="8">
              <InputField
                name="type"
                value={type}
                onChange={onInputChangeIndex}
                label="input.rateExchange"
                type="text"
                invalid={sendForm && !!typeValid}
                feedbackText={sendForm && typeValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="numberCheck"
                value={numberCheck}
                onChange={onInputChangeIndex}
                label="input.numberCheck"
                type="text"
                invalid={sendForm && !!numberCheckValid}
                feedbackText={sendForm && numberCheckValid || null}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Row>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <DateCalendar
                name="date"
                value={date}
                onChange={onInputChangeIndex}
                label="select.date"
              />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <SimpleSelect
                name="currencyName"
                value={currencyName}
                label="page.checks.select.typeCurrency"
                onChange={onInputChangeIndex}
                options={listCurrencyName}
                invalid={sendForm && !!currencyNameValid}
                feedbackText={sendForm && currencyNameValid || null} />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <SimpleSelect
                name="cityId"
                value={cityId}
                label="page.checks.select.cityId"
                onChange={onInputChangeIndex}
                options={listCityName} />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <InputField
                name="requestId"
                value={requestId}
                onChange={onInputChangeIndex}
                label="page.checks.imput.recuestId"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <Checkbox
                name="status"
                value={status}
                onChange={onInputChangeIndex}
                label="check.status" />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </>
  )
}
