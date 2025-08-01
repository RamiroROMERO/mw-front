/* eslint-disable react/prop-types */
import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Row } from 'reactstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';

const HeaderPayroll = ({date, customerId, projectId, dateStart, dateEnd, notes, listCustomers, listProjectsFilter, onInputChange, formValidation, sendForm, onCustomerChange}) => {

  const {dateValid, customerIdValid, projectIdValid, dateStartValid, dateEndValid} = formValidation;

  return (
    <Row>
      <Colxx xxs="12" sm="12" lg="8" xl="7">
        <SearchSelect
          label='select.customer'
          name='customerId'
          inputValue={customerId}
          options={listCustomers}
          onChange={onCustomerChange}
          invalid={sendForm && !!customerIdValid}
          feedbackText={sendForm && (customerIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="4" xl="5">
        <SearchSelect
          label='page.dailyReport.select.projectId'
          name='projectId'
          inputValue={projectId}
          options={listProjectsFilter}
          onChange={onInputChange}
          invalid={sendForm && !!projectIdValid}
          feedbackText={sendForm && (projectIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3" xl="3">
        <DateCalendar
          name="date"
          value={date}
          label='select.date'
          onChange={onInputChange}
          invalid={sendForm && !!dateValid}
          feedbackText={sendForm && (dateValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3">
        <DateCalendar
          name="dateStart"
          value={dateStart}
          label='select.dateStart'
          onChange={onInputChange}
          invalid={sendForm && !!dateStartValid}
          feedbackText={sendForm && (dateStartValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3">
        <DateCalendar
          name="dateEnd"
          value={dateEnd}
          label='select.dateEnd'
          onChange={onInputChange}
          invalid={sendForm && !!dateEndValid}
          feedbackText={sendForm && (dateEndValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="12">
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