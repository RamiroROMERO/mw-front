import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';

export const LittleCashForm = (props) => {
  const { formStateIndex, onInputChangeIndex, listDocto, listAccount, listFunds, formValidationIndex, sendForm } = props;

  const {
    date, documentCode, idCch, providerName, description, idCtaAccount, valuePayment,
    compTaxId, compName, compNumber, compSubt, compExen, compExon, compGrav, compDiscount, compTax, compTotal,
    idLiquida, accountId
  } = formStateIndex;
  const { dateValid, documentCodeValid, idCchValid, idCtaAccountValid, providerNameValid, descriptionValid } = formValidationIndex;

  const disabled = Number(idLiquida) !== 0;

  return (
    <>
      <Row className='mb-3'>
        <Colxx xxs="12" md="6" lg="3">
          <DateCalendar
            name="date"
            value={date}
            onChange={onInputChangeIndex}
            label="select.date"
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && dateValid || null}
            disabled={disabled}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <SearchSelect
            name="idCch"
            inputValue={idCch}
            onChange={onInputChangeIndex}
            label="page.littleCash.select.fund"
            options={listFunds}
            invalid={sendForm && !!idCchValid}
            feedbackText={sendForm && idCchValid || null}
            isDisabled={disabled}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <SearchSelect
            name="documentCode"
            inputValue={documentCode}
            onChange={onInputChangeIndex}
            label="input.document"
            options={listDocto}
            invalid={sendForm && !!documentCodeValid}
            feedbackText={sendForm && documentCodeValid || null}
            isDisabled={disabled}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <InputField
            name="valuePayment"
            value={valuePayment}
            onChange={onInputChangeIndex}
            label="input.valueLps"
            type="text"
            disabled={disabled}
          />
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xxs="12" md="6">
          <InputField
            name="providerName"
            value={providerName}
            onChange={onInputChangeIndex}
            label="page.littleCash.input.beneficiary"
            type="text"
            invalid={sendForm && !!providerNameValid}
            feedbackText={sendForm && providerNameValid || null}
            disabled={disabled}
          />
        </Colxx>
        <Colxx xxs="12" md="6">
          <SearchSelect
            name="idCtaAccount"
            inputValue={idCtaAccount}
            onChange={onInputChangeIndex}
            label="page.littleCash.select.expenseAccount"
            options={listAccount}
            invalid={sendForm && !!idCtaAccountValid}
            feedbackText={sendForm && idCtaAccountValid || null}
            isDisabled={disabled}
          />
        </Colxx>
        <Colxx xxs="12">
          <InputField
            name="description"
            value={description}
            onChange={onInputChangeIndex}
            label="page.littleCash.input.concept"
            type="textarea"
            invalid={sendForm && !!descriptionValid}
            feedbackText={sendForm && descriptionValid || null}
            disabled={disabled}
          />
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xxs="12">
          <h6>{IntlMessages("page.littleCash.section.comprobante")}</h6>
        </Colxx>
        <Colxx xxs="12" md="4">
          <InputField name="compTaxId" value={compTaxId} onChange={onInputChangeIndex} label="page.littleCash.input.compTaxId" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4">
          <InputField name="compName" value={compName} onChange={onInputChangeIndex} label="page.littleCash.input.compName" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4">
          <InputField name="compNumber" value={compNumber} onChange={onInputChangeIndex} label="page.littleCash.input.compNumber" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compSubt" value={compSubt} onChange={onInputChangeIndex} label="page.littleCash.input.compSubt" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compExen" value={compExen} onChange={onInputChangeIndex} label="page.littleCash.input.compExen" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compExon" value={compExon} onChange={onInputChangeIndex} label="page.littleCash.input.compExon" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compGrav" value={compGrav} onChange={onInputChangeIndex} label="page.littleCash.input.compGrav" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compDiscount" value={compDiscount} onChange={onInputChangeIndex} label="table.column.discount" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compTax" value={compTax} onChange={onInputChangeIndex} label="table.column.tax" type="text" disabled={disabled} />
        </Colxx>
        <Colxx xxs="12" md="4" lg="2">
          <InputField name="compTotal" value={compTotal} onChange={onInputChangeIndex} label="table.column.total" type="text" bold disabled={disabled} />
        </Colxx>
      </Row>
      {Number(accountId) > 0 && (
        <Row>
          <Colxx xxs="12" md="4">
            <InputField name="accountId" value={accountId} label="page.littleCash.input.pdaNumber" type="text" disabled />
          </Colxx>
        </Row>
      )}
    </>
  )
}
