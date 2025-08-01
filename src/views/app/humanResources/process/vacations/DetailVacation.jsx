import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import UploadFile from '@Components/uploadFile'
import { Checkbox } from '@Components/checkbox'

const DetailVacation = ({employeeId,date,dateStart,dateEnd,description,notes,phoneContact,authorizedById,filePath,setFilePath,status, incSunday, paidVacation, listImmediateBoss,listEmployees,onInputChange,formValidation, sendForm}) => {

  const {employeeIdValid, dateValid, dateStartValid, dateEndValid, authorizedByIdValid} = formValidation;

  return (
    <Row>
      <Colxx xxs="12" md="8" lg="9">
        <Row>
          <Colxx xxs="12" xs="12" lg="8">
            <SearchSelect
              label='select.employee'
              name='employeeId'
              inputValue={employeeId}
              options={listEmployees}
              onChange={onInputChange}
              invalid={sendForm && !!employeeIdValid}
              feedbackText={sendForm && (employeeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" lg="4">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" lg="4">
            <DateCalendar
              name="dateStart"
              value={dateStart}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!dateStartValid}
              feedbackText={sendForm && (dateStartValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" lg="4">
            <DateCalendar
              name="dateEnd"
              value={dateEnd}
              label='select.dateEnd'
              onChange={onInputChange}
              invalid={sendForm && !!dateEndValid}
              feedbackText={sendForm && (dateEndValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6" lg="4" className="mb-3">
            <Checkbox
              label="check.incSunday"
              name="incSunday"
              value={incSunday}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" lg="4" className="mb-3">
            <Checkbox
              label="check.paidVacation"
              name="paidVacation"
              value={paidVacation}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" lg="4" className="mb-3">
            <Checkbox
              label="check.approved"
              name="status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name='description'
              label='input.description'
              value={description}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name='notes'
              label='input.observations'
              value={notes}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" sm="6" md="12" lg="4">
            <InputField
              name='phoneContact'
              label='page.permissions.input.phoneContact'
              value={phoneContact}
              onChange={onInputChange}
              type='text'
            />
          </Colxx>
          <Colxx xxs="12" sm="6" md="12" lg="8">
            <SearchSelect
              label='page.permissions.input.authorizedBy'
              name="authorizedById"
              inputValue={authorizedById}
              options={listImmediateBoss}
              onChange={onInputChange}
              invalid={sendForm && !!authorizedByIdValid}
              feedbackText={sendForm && (authorizedByIdValid || null)}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" md="4" lg="3">
        <UploadFile
          filePath={filePath}
          setFilePath={setFilePath}
        />
      </Colxx>
    </Row>
  )
}

export default DetailVacation