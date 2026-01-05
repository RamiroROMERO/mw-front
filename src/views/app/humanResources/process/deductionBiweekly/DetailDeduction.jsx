import React, { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { request } from '@Helpers/core'

const DetailDeduction = ({ id, date, biweekId, employeeId, description, value, listEmployees, listBiweeklies, onResetForm,
  onInputChange, fnGetData, setLoading, formValidation, isFormValid }) => {

  const [sendForm, setSendForm] = useState(false);
  const { dateValid, biweekIdValid, employeeIdValid, valueValid, descriptionValid } = formValidation;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      date,
      biweekId,
      employeeId,
      description,
      value
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/biweeklyDeductions', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/biweeklyDeductions/${id}`, newData, () => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <Colxx xxs="12" sm="6" lg="12">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12">
            <SearchSelect
              label='select.biweekId'
              name='biweekId'
              inputValue={biweekId}
              options={listBiweeklies}
              onChange={onInputChange}
              invalid={sendForm && !!biweekIdValid}
              feedbackText={sendForm && (biweekIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12">
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
          <Colxx xxs="12" sm="6" lg="12">
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
          <Colxx xxs="12">
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
        </Row>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button color="secondary" onClick={fnClearInputs}>
              <i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button color="primary" onClick={fnSave}>
              <i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailDeduction