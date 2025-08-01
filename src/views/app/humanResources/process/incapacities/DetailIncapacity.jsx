import React from 'react'
import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'

const DetailIncapacity = ({date, employeeId, reason, description, medicalAsistance, startDisability, endDisability, comments,
  employeeStatus, listEmployees, onInputChange, formValidation, sendForm}) => {

  const {dateValid, employeeIdValid, reasonValid, descriptionValid, startDisabilityValid, endDisabilityValid} = formValidation;

  return (
    <Row>
      <Colxx xxs="12" lg="12" xl="12">
        <Row>
          <Colxx xxs="12" xs="5" sm="4">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="7" sm="8">
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
          <Colxx xxs="12" xl="6">
            <InputField
              name="reason"
              label='input.reason'
              value={reason}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!reasonValid}
              feedbackText={sendForm && (reasonValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xl="6">
            <InputField
              name="medicalAsistance"
              label='page.accidents.input.medicalAssistance'
              value={medicalAsistance}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xl="6">
            <InputField
              name="description"
              label='input.description'
              value={description}
              onChange={onInputChange}
              type="textarea"
              invalid={sendForm && !!descriptionValid}
              feedbackText={sendForm && (descriptionValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xl="6">
            <InputField
              name="employeeStatus"
              label='page.accidents.input.employeeStatus'
              value={employeeStatus}
              onChange={onInputChange}
              type="textarea"
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="startDisability"
              value={startDisability}
              label='page.accidents.select.startDisability'
              onChange={onInputChange}
              invalid={sendForm && !!startDisabilityValid}
              feedbackText={sendForm && (startDisabilityValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="endDisability"
              value={endDisability}
              label='page.accidents.select.endDisability'
              onChange={onInputChange}
              invalid={sendForm && !!endDisabilityValid}
              feedbackText={sendForm && (endDisabilityValid || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.accidents.label.observationsRRHH">
              <Row>
                <Colxx xxs="12">
                  <InputField
                    name='comments'
                    label='input.comments'
                    value={comments}
                    onChange={onInputChange}
                    type='textarea'
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default DetailIncapacity