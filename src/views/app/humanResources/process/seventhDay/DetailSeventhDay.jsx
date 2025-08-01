import React, { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import DateCalendar from '@Components/dateCalendar'

const DetailSeventhDay = ({date, dateStart, dateEnd, onInputChange, onResetForm, formValidation, isFormValid}) => {
  const [sendForm, setSendForm] = useState(false);

  const {dateValid, dateStartValid, dateEndValid} = formValidation;

  const fnSave = () =>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const newData = {
      date,
      dateStart,
      dateEnd
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
          <Colxx xxs="12" md="6" lg="12">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" lg="12">
            <DateCalendar
              name="dateStart"
              value={dateStart}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!dateStartValid}
              feedbackText={sendForm && (dateStartValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" lg="12">
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

export default DetailSeventhDay