import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { SimpleSelect } from '@Components/simpleSelect'
import { Checkbox } from '@Components/checkbox'
import { InputField } from '@Components/inputFields'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import UploadFile from '@Components/uploadFile'
import DateCalendar from '@Components/dateCalendar'
import DateTimeCalendar from '@Components/dateTimeCalendar'

const DetailPermission = ({employeeId, date, typeId, applicationTypeId, dateStart, dateEnd, phoneContact, reason, description,
  notes, authorizedById, filePath, withPayment, setFilePath, status, listImmediateBoss, listEmployees, onInputChange,
  formValidation, sendForm}) => {

  const {employeeIdValid, dateValid, typeIdValid, applicationTypeIdValid, dateStartValid, dateEndValid, reasonValid,
    authorizedByIdValid} = formValidation;

  return (
    <Row>
      <Colxx xxs="12" lg="8">
        <Row>
          <Colxx xxs="12" xs="12" sm="8" lg="8">
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
          <Colxx xxs="12" xs="6" sm="4" lg="4">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" lg="4">
            <SimpleSelect
              name="typeId"
              value={typeId}
              label="select.type"
              onChange={onInputChange}
              options={[
                {id:1, name:"Por Dias"},
                {id:2, name:"Por Horas"}
              ]}
              invalid={sendForm && !!typeIdValid}
              feedbackText={sendForm && (typeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="5" lg="4">
            <SimpleSelect
              name="applicationTypeId"
              value={applicationTypeId}
              label="page.permissions.select.applicationType"
              onChange={onInputChange}
              options={[
                {id:1, name:"Cargo a Vacaciones"},
                {id:2, name:"Con Goce de Sueldo"},
                {id:3, name:"Sin Goce de Sueldo"}
              ]}
              invalid={sendForm && !!applicationTypeIdValid}
              feedbackText={sendForm && (applicationTypeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="4">
            <DateTimeCalendar
              name="dateStart"
              value={dateStart}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!dateStartValid}
              feedbackText={sendForm && (dateStartValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="4">
            <DateTimeCalendar
              name="dateEnd"
              value={dateEnd}
              label='select.dateEnd'
              onChange={onInputChange}
              invalid={sendForm && !!dateEndValid}
              feedbackText={sendForm && (dateEndValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" lg="4">
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
              name='reason'
              label='page.permissions.input.reason'
              value={reason}
              onChange={onInputChange}
              type='text'
              invalid={sendForm && !!reasonValid}
              feedbackText={sendForm && (reasonValid || null)}
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
      </Colxx>
      <Colxx xxs="12" lg="4">
        <Row>
          <Colxx xxs="12" sm="6" lg="12" xl="12" className="mb-3">
            <UploadFile
              filePath={filePath}
              setFilePath={setFilePath}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12" xl="12">
            <Row>
              <Colxx xxs="12" xs="6" sm="12">
                <InputField
                  name='phoneContact'
                  label='page.permissions.input.phoneContact'
                  value={phoneContact}
                  onChange={onInputChange}
                  type='text'
                />
              </Colxx>
              <Colxx xxs="12" xs="6" sm="12">
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
              <Colxx xxs="12" xs="6" sm="12">
                <Checkbox
                  label="page.permissions.check.withPay"
                  name="withPayment"
                  value={withPayment}
                  onChange={onInputChange}
                />
              </Colxx>
            </Row>
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default DetailPermission