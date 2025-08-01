import React, { useState } from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import { IntlMessages } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'

const DetailProject = ({id, customerId, code, name, description, initDate, markAssistance, status, listCustomers, onInputChange, fnGetData, onResetForm, setLoading, formValidation, isFormValid}) => {

  const [sendForm, setSendForm] = useState(false);
  const {customerIdValid, codeValid, nameValid, initDateValid} = formValidation;

  const fnSave = () =>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const newData = {
      customerId,
      code,
      name,
      description,
      initDate,
      markAssistance,
      status
    }

    if(id === 0){
      setLoading(true);
      request.POST('rrhh/process/projects', newData, (resp) => {
        onInputChange({target:{name:'id', value:resp.data.id}});
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/projects/${id}`, newData, () => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
  }

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" md="6" xl="12">
            <SearchSelect
              label='select.customer'
              name='customerId'
              inputValue={customerId}
              options={listCustomers}
              onChange={onInputChange}
              invalid={sendForm && !!customerIdValid}
              feedbackText={sendForm && (customerIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" xl="12">
            <InputField
              name='code'
              label='input.code'
              value={code}
              onChange={onInputChange}
              type='text'
              invalid={sendForm && !!codeValid}
              feedbackText={sendForm && (codeValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" xl="12">
            <InputField
              name='name'
              label='input.name'
              value={name}
              onChange={onInputChange}
              type='text'
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" xl="12">
            <InputField
              name='description'
              label='input.description'
              value={description}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
          <Colxx xxs="12" md="6" xl="12">
            <DateCalendar
              name="initDate"
              value={initDate}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!initDateValid}
              feedbackText={sendForm && (initDateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" xl="7">
            <Checkbox
              label='check.markAssistance'
              name="markAssistance"
              value={markAssistance}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" md="6" xl="5">
            <Checkbox
              label='check.status'
              name="status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button color="secondary" onClick={fnClearInputs}>
              <i className="bi bi-stars"/> {IntlMessages("button.clear")}
            </Button>
            <Button color="primary" onClick={fnSave}>
              <i className="iconsminds-save"/> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailProject