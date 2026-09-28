import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';

export const UseTransferAccountsForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listDocIn, listDocOut, listBanks, formValidationIndex, sendForm } = props;

  const {
    date, documentCodeIn, documentIdIn, bankCodeIn, bankAccountNameIn, referenceNumberIn,
    documentCodeOut, documentIdOut, bankCodeOut, bankAccountNameOut, referenceNumberOut,
    description, value, exchangeRate
  } = formStateIndex;

  const {
    dateValid, documentCodeInValid, bankCodeInValid, referenceNumberInValid,
    documentCodeOutValid, bankCodeOutValid, referenceNumberOutValid
  } = formValidationIndex;

  return (
    <>
      <Row className='mb-3'>
        <Colxx xxs="12" md="4">
          <DateCalendar
            name="date"
            value={date}
            onChange={onInputChangeIndex}
            label="select.date"
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && dateValid || null}
          />
        </Colxx>
        <Colxx xxs="6" md="4">
          <InputField
            name="value"
            value={value}
            onChange={onInputChangeIndex}
            label="input.valueLps"
            type="text"
          />
        </Colxx>
        <Colxx xxs="6" md="4">
          <InputField
            name="exchangeRate"
            value={exchangeRate}
            onChange={onInputChangeIndex}
            label="input.rateExchange"
            type="text"
          />
        </Colxx>
        <Colxx xxs="12">
          <InputField
            name="description"
            value={description}
            onChange={onInputChangeIndex}
            label="page.variousDeposits.input.description"
            type="textarea"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" md="6" className="mb-3">
          <ContainerWithLabel label="page.transferAccounts.title.origin">
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  name="documentCodeIn"
                  inputValue={documentCodeIn}
                  onChange={onInputChangeIndex}
                  label="input.document"
                  options={listDocIn}
                  invalid={sendForm && !!documentCodeInValid}
                  feedbackText={sendForm && documentCodeInValid || null}
                />
              </Colxx>
              <Colxx xxs="8">
                <SearchSelect
                  name="bankCodeIn"
                  inputValue={bankCodeIn}
                  onChange={onInputChangeIndex}
                  label="page.transferAccounts.select.originAccount"
                  options={listBanks}
                  invalid={sendForm && !!bankCodeInValid}
                  feedbackText={sendForm && bankCodeInValid || null}
                />
              </Colxx>
              <Colxx xxs="4">
                <InputField
                  name="bankAccountNameIn"
                  value={bankAccountNameIn}
                  onChange={onInputChangeIndex}
                  label="input.numberAccount"
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="referenceNumberIn"
                  value={referenceNumberIn}
                  onChange={onInputChangeIndex}
                  label="page.transferAccounts.input.referenceIn"
                  type="text"
                  invalid={sendForm && !!referenceNumberInValid}
                  feedbackText={sendForm && referenceNumberInValid || null}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="documentIdIn"
                  value={documentIdIn}
                  onChange={onInputChangeIndex}
                  label="page.variousDeposits.input.documentNumber"
                  type="text"
                  disabled
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs="12" md="6" className="mb-3">
          <ContainerWithLabel label="page.transferAccounts.title.destination">
            <Row>
              <Colxx xxs="12">
                <SearchSelect
                  name="documentCodeOut"
                  inputValue={documentCodeOut}
                  onChange={onInputChangeIndex}
                  label="input.document"
                  options={listDocOut}
                  invalid={sendForm && !!documentCodeOutValid}
                  feedbackText={sendForm && documentCodeOutValid || null}
                />
              </Colxx>
              <Colxx xxs="8">
                <SearchSelect
                  name="bankCodeOut"
                  inputValue={bankCodeOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAccounts.select.destinationAccount"
                  options={listBanks}
                  invalid={sendForm && !!bankCodeOutValid}
                  feedbackText={sendForm && bankCodeOutValid || null}
                />
              </Colxx>
              <Colxx xxs="4">
                <InputField
                  name="bankAccountNameOut"
                  value={bankAccountNameOut}
                  onChange={onInputChangeIndex}
                  label="input.numberAccount"
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="referenceNumberOut"
                  value={referenceNumberOut}
                  onChange={onInputChangeIndex}
                  label="page.transferAccounts.input.referenceOut"
                  type="text"
                  invalid={sendForm && !!referenceNumberOutValid}
                  feedbackText={sendForm && referenceNumberOutValid || null}
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="documentIdOut"
                  value={documentIdOut}
                  onChange={onInputChangeIndex}
                  label="page.variousDeposits.input.documentNumber"
                  type="text"
                  disabled
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </>
  )
}
