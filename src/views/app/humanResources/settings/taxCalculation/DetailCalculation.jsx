import React from 'react'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils';
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';

const DetailCalculation = ({rangeInit, rangeEnd, percentValue, status, fnSave, onInputChange, fnClearInputs, formValidation, sendForm}) => {

  const { rangeInitValid, rangeEndValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row className='mb-3'>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="rangeInit"
              value={rangeInit}
              onChange={onInputChange}
              type="number"
              label="page.taxCalculation.input.starTingRange"
              invalid={sendForm && !!rangeInitValid}
              feedbackText={sendForm && (rangeInitValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="rangeEnd"
              value={rangeEnd}
              onChange={onInputChange}
              type="number"
              label="page.taxCalculation.input.rangeEnd"
              invalid={sendForm && !!rangeEndValid}
              feedbackText={sendForm && (rangeEndValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="percentValue"
              value={percentValue}
              onChange={onInputChange}
              type="number"
              label="page.taxCalculation.input.porcentage"
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <Checkbox
              name="status"
              value={status}
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
              color="primary" onClick={fnSave}><i className="iconsminds-save"/> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
  </Card>
  )
}

export default DetailCalculation