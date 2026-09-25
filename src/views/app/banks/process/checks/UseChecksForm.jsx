import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';

export const UseChecksForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listBanks, listProvider, listCurrencyName, formValidationIndex, sendForm } = props;

  const { document, bankCode, bankAccountName, providerId, providerName, date, value, valueUsd, exchangeRate, currencyName, checkNumber, referenceCode } = formStateIndex;

  const { dateValid, bankCodeValid, providerNameValid } = formValidationIndex;

  return (
    <>
      <Row className='mb-3'>
        <Colxx xxs="12" sm="12" md="12" lg="8">
          <Row>
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
                name="bankAccountName"
                value={bankAccountName}
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
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="checkNumber"
                value={checkNumber}
                onChange={onInputChangeIndex}
                label="input.numberCheck"
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" xs="12" md="12">
              <InputField
                name="providerName"
                value={providerName}
                onChange={onInputChangeIndex}
                label="page.checks.input.beneficiary"
                type="text"
                invalid={sendForm && !!providerNameValid}
                feedbackText={sendForm && providerNameValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="12" md="12">
              <InputField
                name="referenceCode"
                value={referenceCode}
                onChange={onInputChangeIndex}
                label="page.checks.input.referenceCode"
                type="text"
              />
            </Colxx>
            <Colxx xxs="6" xs="6" md="6">
              <InputField
                name="value"
                value={value}
                onChange={onInputChangeIndex}
                label="input.valueLps"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="6" xs="6" md="6">
              <InputField
                name="valueUsd"
                value={valueUsd}
                onChange={onInputChangeIndex}
                label="input.valueUsd"
                type="text"
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
                invalid={sendForm && !!dateValid}
                feedbackText={sendForm && dateValid || null}
              />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <SimpleSelect
                name="currencyName"
                value={currencyName}
                label="page.checks.select.typeCurrency"
                onChange={onInputChangeIndex}
                options={listCurrencyName}
              />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <InputField
                name="exchangeRate"
                value={exchangeRate}
                onChange={onInputChangeIndex}
                label="input.rateExchange"
                type="text"
              />
            </Colxx>
            <Colxx xxs="6" xs="6" sm="6" md="6" lg="12">
              <InputField
                name="document"
                value={document}
                onChange={onInputChangeIndex}
                label="input.document"
                type="text"
                disabled
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </>
  )
}
