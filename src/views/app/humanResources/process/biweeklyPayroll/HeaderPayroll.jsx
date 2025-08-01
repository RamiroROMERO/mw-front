import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'

const HeaderPayroll = ({date, biweekId, notes, listBiweeklies, previousPayroll, onInputChange, formValidation, sendForm,
  setBulkForm}) => {

  const {dateValid, biweekIdValid} = formValidation;

  const onBiweekIdChange = e =>{
    const idBiweek = e.target.value;
    setBulkForm({id: 0, date: '', biweekId: idBiweek, notes: '', previousPayroll: 0});
  }

  return (
    <Row>
      <Colxx xxs="12" sm="5" lg="5" xl="6">
        <SearchSelect
          name="biweekId"
          label='select.biweekId'
          inputValue={biweekId}
          options={listBiweeklies}
          onChange={onBiweekIdChange}
          invalid={sendForm && !!biweekIdValid}
          feedbackText={sendForm && (biweekIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="4" lg="4" xl="4">
        <DateCalendar
          name="date"
          value={date}
          label='select.date'
          onChange={onInputChange}
          invalid={sendForm && !!dateValid}
          feedbackText={sendForm && (dateValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="3" lg="3" xl="2">
        <Checkbox
          label="page.biweeklyPayroll.check.previousPayroll"
          name="previousPayroll"
          value={previousPayroll}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12">
        <InputField
          name="notes"
          label='input.notes'
          value={notes}
          onChange={onInputChange}
          type="textarea"
        />
      </Colxx>
    </Row>
  )
}

export default HeaderPayroll