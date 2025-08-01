import React from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields'
import { Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';

const  DetailTax = ({rangeInit, rangeEnd, range, rate, total, status, onInputChange,fnSave, fnClearInputs, formValidation, sendForm})=> {

  const { rangeInitValid, rangeEndValid, rangeValid, rateValid } = formValidation;

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
              label="page.neighborhoodTax.input.starTingRange"
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
              label="page.neighborhoodTax.input.rangeEnd"
              invalid={sendForm && !!rangeEndValid}
              feedbackText={sendForm && (rangeEndValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="range"
              value={range}
              onChange={onInputChange}
              type="number"
              label="page.neighborhoodTax.input.range"
              invalid={sendForm && !!rangeValid}
              feedbackText={sendForm && (rangeValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="rate"
              value={rate}
              onChange={onInputChange}
              type="number"
              label="page.neighborhoodTax.input.rate"
              invalid={sendForm && !!rateValid}
              feedbackText={sendForm && (rateValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="total"
              value={total}
              onChange={onInputChange}
              type="text"
              label="page.neighborhoodTax.input.total"
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="6">
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

export default DetailTax;