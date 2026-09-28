import { Row, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';

export const UseVariousDepositsForm = (props) => {
  const {
    formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount, listCustomer,
    formValidationIndex, sendForm, fnSelectAdvance, fnRemoveAdvance
  } = props;

  const {
    documentCode, documentId, date, bankCode, bankAccountName, description, referenceCode,
    idCtaCont, value, exchangeRate, customerId, customerName, advanceId, advanceProviderName, advanceValue
  } = formStateIndex;

  const {
    dateValid, bankCodeValid, documentCodeValid, idCtaContValid, descriptionValid, referenceCodeValid
  } = formValidationIndex;

  return (
    <>
      <Row className='mb-3'>
        <Colxx xxs="12" sm="12" md="12" lg="8">
          <Row>
            <Colxx xxs="12" xs="7" md="8">
              <SearchSelect
                name="documentCode"
                inputValue={documentCode}
                onChange={onInputChangeIndex}
                label="input.document"
                options={listDocto}
                invalid={sendForm && !!documentCodeValid}
                feedbackText={sendForm && documentCodeValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="documentId"
                value={documentId}
                onChange={onInputChangeIndex}
                label="page.variousDeposits.input.documentNumber"
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
                name="bankAccountName"
                value={bankAccountName}
                onChange={onInputChangeIndex}
                label="input.numberAccount"
                type="text"
                disabled
              />
            </Colxx>
            <Colxx xxs="12">
              <InputField
                name="description"
                value={description}
                onChange={onInputChangeIndex}
                label="page.variousDeposits.input.description"
                type="textarea"
                invalid={sendForm && !!descriptionValid}
                feedbackText={sendForm && descriptionValid || null}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <InputField
                name="referenceCode"
                value={referenceCode}
                onChange={onInputChangeIndex}
                label="page.variousDeposits.input.referenceCode"
                type="text"
                invalid={sendForm && !!referenceCodeValid}
                feedbackText={sendForm && referenceCodeValid || null}
              />
            </Colxx>
            <Colxx xxs="12" md="6">
              <SearchSelect
                name="idCtaCont"
                inputValue={idCtaCont}
                onChange={onInputChangeIndex}
                label="page.variousDeposits.select.incomeAccount"
                options={listAccount}
                invalid={sendForm && !!idCtaContValid}
                feedbackText={sendForm && idCtaContValid || null}
              />
            </Colxx>
            <Colxx xxs="12" xs="7" md="8">
              <SearchSelect
                name="customerId"
                inputValue={customerId}
                onChange={onInputChangeIndex}
                label="page.variousDeposits.select.customer"
                options={listCustomer}
              />
            </Colxx>
            <Colxx xxs="12" xs="5" md="4">
              <InputField
                name="customerName"
                value={customerName}
                onChange={onInputChangeIndex}
                label="page.variousDeposits.input.customerName"
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
              <InputField
                name="value"
                value={value}
                onChange={onInputChangeIndex}
                label="input.valueLps"
                type="text"
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
            {advanceId > 0 ? (
              <Colxx xxs="12">
                <div className="border rounded p-2 mt-2">
                  <div className="mb-1"><b>{advanceProviderName}</b></div>
                  <InputField
                    name="advanceValue"
                    value={advanceValue}
                    onChange={onInputChangeIndex}
                    label="page.variousDeposits.input.advanceValue"
                    type="text"
                  />
                  <Button color="danger" outline size="sm" className="mt-1" onClick={fnRemoveAdvance}>
                    <i className="bi bi-x-circle" /> {IntlMessages('page.variousDeposits.button.removeAdvance')}
                  </Button>
                </div>
              </Colxx>
            ) : (
              <Colxx xxs="12">
                <Button color="primary" outline size="sm" className="mt-2" onClick={fnSelectAdvance}>
                  <i className="bi bi-clock-history" /> {IntlMessages('page.variousDeposits.button.selectAdvance')}
                </Button>
              </Colxx>
            )}
          </Row>
        </Colxx>
      </Row>
    </>
  )
}
