import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';

export const UseCashWithdrawalForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount, formValidationIndex, sendForm } = props;

  const { date, documentCode, bankCode, bankAccountName, description, referenceCode, idCtaCont, value, exchangeRate } = formStateIndex;
  const { dateValid, documentCodeValid, bankCodeValid, idCtaContValid, descriptionValid, referenceCodeValid } = formValidationIndex;

  return (
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
        </Row>
      </Colxx>
    </Row>
  )
}
