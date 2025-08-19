import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import ReactTable from '@Components/reactTable';
import { useDetailIncomes } from './useDetailIncomes';

export const DetailIncomes = ({id, date, employeeName, typeId, value, days, hours, description, projectId, setProjectId, onProjectChange, onResetForm, listEmployeesByProject, listTypeIncomes, listProjects, onInputChange, fnGetData, setLoading, formValidation, isFormValid}) => {

  const {dateValid, typeIdValid, valueValid, descriptionValid} = formValidation;

  const {table, sendForm, fnSave, fnClearInputs} = useDetailIncomes({id, projectId, setProjectId, onResetForm, listEmployeesByProject, fnGetData, setLoading, isFormValid, date, typeId, description, value, days, hours});

  return (
    <Card>
      <CardBody>
        <Row>
          <Colxx xxs="12" md="7" lg="6" xxl="7">
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
              <Colxx xxs={12}>
                <SearchSelect
                  label='select.project'
                  name='projectId'
                  inputValue={projectId}
                  options={listProjects}
                  onChange={onProjectChange}
                />
              </Colxx>
              <Colxx xxs={12}>
                <ReactTable {...table}/>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" md="5" lg="6" xxl="5">
            <Row>
              <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
                <DateCalendar
                  name="date"
                  value={date}
                  label='select.date'
                  onChange={onInputChange}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && (dateValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
                <InputField
                  name="days"
                  label='input.days'
                  value={days}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
                <InputField
                  name="hours"
                  label='input.hours'
                  value={hours}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
                <InputField
                  name="value"
                  label='input.value'
                  value={value}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!valueValid}
                  feedbackText={sendForm && (valueValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" md="12" lg="12">
                <SearchSelect
                  label='select.typeId'
                  name='typeId'
                  inputValue={typeId}
                  options={listTypeIncomes}
                  onChange={onInputChange}
                  invalid={sendForm && !!typeIdValid}
                  feedbackText={sendForm && (typeIdValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" md="12" lg="12">
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
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnClearInputs}>
                  <i className="bi bi-stars"/> {IntlMessages("button.clear")}
                </Button>
                <Button color="primary" onClick={fnSave}>
                  <i className="iconsminds-save"/> {IntlMessages("button.save")}
                </Button>
              </Colxx>
            </Row>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}
