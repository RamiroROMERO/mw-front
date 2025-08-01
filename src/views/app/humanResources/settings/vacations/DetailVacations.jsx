import React from 'react'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils';
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';

const DetailVacations = ({ name, qtyYears, qtyDays, status, fnSave, onInputChange, formValidation, sendForm, fnClearInputs}) =>{

  const {nameValid, qtyYearsValid, qtyDaysValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="name"
              value={name}
              onChange={onInputChange}
              type="text"
              label="page.vacations.input.description"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="6">
            <InputField
              name="qtyYears"
              value={qtyYears}
              onChange={onInputChange}
              type="text"
              label="page.vacations.input.amountYear"
              invalid={sendForm && !!qtyYearsValid}
              feedbackText={sendForm && (qtyYearsValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="6">
            <InputField
              name="qtyDays"
              value={qtyDays}
              onChange={onInputChange}
              type="text"
              label="page.vacations.input.amountDay"
              invalid={sendForm && !!qtyDaysValid}
              feedbackText={sendForm && (qtyDaysValid || null)}
            />
          </Colxx>
          <Colxx>
            <Checkbox
              name="status"
              value ={status}
              onChange={onInputChange}
              label="check.status"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" align="right">
            <Button
              color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
  </Card>
  )
}

export default DetailVacations;