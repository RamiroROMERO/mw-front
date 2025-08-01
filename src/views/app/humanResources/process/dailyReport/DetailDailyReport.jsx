import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import { validInt } from '@Helpers/Utils'

const DetailDailyReport = ({date, customerId, projectId, responsibleId, scheduleId, notes, status, listCustomers, listProjects,
  listManagers, listSchedules, filterProjects, setFilterProjects, onInputChange, setBulkForm, formValidation, sendForm}) => {

  const {dateValid, customerIdValid, projectIdValid, responsibleIdValid, scheduleIdValid} = formValidation;

  const onCustomerChange = e =>{
    const custId = validInt(e.target.value);

    const filter = listProjects.filter((item)=>{
      return item.customerId === custId
    });

    setFilterProjects(filter);

    setBulkForm({customerId: custId, projectId:0});
  }

  return (
    <Row>
      <Colxx xxs="12" sm="8" lg="9">
        <DateCalendar
          name="date"
          value={date}
          label='select.date'
          onChange={onInputChange}
          invalid={sendForm && !!dateValid}
          feedbackText={sendForm && (dateValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="4" md="3" className="mb-3">
        <Checkbox
          label='check.status'
          name="status"
          value={status}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="7" lg="12">
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
      <Colxx xxs="12" md="5" lg="12">
        <SearchSelect
          label='page.dailyReport.select.projectId'
          name='projectId'
          inputValue={projectId}
          options={filterProjects}
          onChange={onInputChange}
          invalid={sendForm && !!projectIdValid}
          feedbackText={sendForm && (projectIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" md="5" lg="12">
        <SearchSelect
          label='page.employees.select.workSchedule'
          name="scheduleId"
          inputValue={scheduleId}
          options={listSchedules}
          onChange={onInputChange}
          invalid={sendForm && !!scheduleIdValid}
          feedbackText={sendForm && (scheduleIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" md="7" lg="12">
        <SearchSelect
          label='page.dailyReport.select.managerId'
          name='responsibleId'
          inputValue={responsibleId}
          options={listManagers}
          onChange={onInputChange}
          invalid={sendForm && !!responsibleIdValid}
          feedbackText={sendForm && (responsibleIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12">
        <InputField
          name='notes'
          label='input.notes'
          value={notes}
          onChange={onInputChange}
          type='textarea'
          style={{resize:'none'}}
        />
      </Colxx>
    </Row>
  )
}

export default DetailDailyReport