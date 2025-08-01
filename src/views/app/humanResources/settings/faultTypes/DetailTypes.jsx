import React from 'react'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils';
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { Checkbox } from '@Components/checkbox';

const DetailTypes= ({ faulClassificationId, name, status, onInputChange, fnSave, typesFault, formValidation, sendForm, fnClearInputs}) => {

  const {nameValid, faulClassificationIdValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="name"
              type="text"
              value={name}
              onChange={onInputChange}
              label="page.faultTypes.input.name"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <SearchSelect
              name="faulClassificationId"
              inputValue={faulClassificationId}
              onChange={onInputChange}
              options={typesFault}
              label="table.column.classification"
              invalid={sendForm && !!faulClassificationIdValid}
              feedbackText={sendForm && (faulClassificationIdValid || null)}
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="6" lg="12">
            <Checkbox
              name ="status"
              value={status}
              label="check.status"
              onChange={onInputChange}
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

export default DetailTypes;