import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import { IntlMessages } from '@Helpers/Utils'

const Detail = ({formState, formValidation, onInputChange, sendForm, fnClear, fnSaveDocument}) => {
  const {name, status} = formState;

  const {nameValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12}>
            <InputField
              name="name"
              label="input.name"
              onChange={onInputChange}
              value={name}
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} align="right">
            <Checkbox
              name="status"
              label="check.status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <hr/>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSaveDocument}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail