import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { InputField } from '@Components/inputFields'
import { validFloat } from '@Helpers/Utils'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'

const DetailPayment = ({employeeName, date, typeId, valueCapital, valueInterest, value, noQuotes, valueQuote, dateStart, description, notes, listTypeDeductions, onInputChange, formValidation, sendForm, setBulkForm, onCapitalChange, onInterestChange}) => {

  const {dateValid, typeIdValid, descriptionValid, valueValid, valueCapitalValid, valueQuoteValid, dateStartValid} = formValidation;

  const onValueChange = e =>{
    const valuePay = e.target.value;

    const numQuotas = validFloat(valueQuote)>0 ? validFloat(valuePay) / validFloat(valueQuote):0;

    const newValue = {
      value: valuePay,
      noQuotes: validFloat(numQuotas)
    }
    setBulkForm(newValue);
  }

  const onValueQuoteChange = e =>{
    const valQuote = e.target.value;

    const numQuotas = validFloat(valQuote)>0 ? validFloat(value) / validFloat(valQuote):0;

    const newValue = {
      valueQuote: valQuote,
      noQuotes: validFloat(numQuotas)
    }
    setBulkForm(newValue);
  }

  return (
    <Row>
      <Colxx xxs="12" style={{ display: employeeName === "" ? 'none' : 'block' }}>
        <InputField
          name="employeeName"
          label='select.employee'
          value={employeeName}
          onChange={onInputChange}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="3">
        <DateCalendar
          name="date"
          value={date}
          label='select.date'
          onChange={onInputChange}
          invalid={sendForm && !!dateValid}
          feedbackText={sendForm && (dateValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" md="8" lg="9" xl="5">
        <InputField
          name="description"
          label='input.description'
          value={description}
          onChange={onInputChange}
          type="text"
          invalid={sendForm && !!descriptionValid}
          feedbackText={sendForm && (descriptionValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="8" md="8" lg="6" xl="4">
        <SearchSelect
          label='select.typeId'
          name='typeId'
          inputValue={typeId}
          options={listTypeDeductions}
          onChange={onInputChange}
          invalid={sendForm && !!typeIdValid}
          feedbackText={sendForm && (typeIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
        <InputField
          name="valueCapital"
          label='input.valueCapital'
          value={valueCapital}
          onChange={onCapitalChange}
          type="text"
          invalid={sendForm && !!valueCapitalValid}
          feedbackText={sendForm && (valueCapitalValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
        <InputField
          name="valueInterest"
          label='input.valueInterest'
          value={valueInterest}
          onChange={onInterestChange}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
        <InputField
          name="value"
          label='input.valueTotal'
          value={value}
          onChange={onValueChange}
          type="text"
          invalid={sendForm && !!valueValid}
          feedbackText={sendForm && (valueValid || null)}
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
        <InputField
          name="valueQuote"
          label='input.valueQuote'
          value={valueQuote}
          onChange={onValueQuoteChange}
          type="text"
          invalid={sendForm && !!valueQuoteValid}
          feedbackText={sendForm && (valueQuoteValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
        <InputField
          name="noQuotes"
          label='input.quota'
          value={noQuotes}
          onChange={onInputChange}
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
        <DateCalendar
          name="dateStart"
          value={dateStart}
          label='select.dateStart'
          onChange={onInputChange}
          invalid={sendForm && !!dateStartValid}
          feedbackText={sendForm && (dateStartValid || null)}
        />
      </Colxx>
      <Colxx xxs="12">
        <InputField
          name="notes"
          label='input.notes'
          value={notes}
          onChange={onInputChange}
          type="textarea"
          style={{resize:'none'}}
        />
      </Colxx>
    </Row>
  )
}

export default DetailPayment