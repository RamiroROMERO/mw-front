import React from 'react';
import {Button, Card, Row, CardBody, CardTitle} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';

const DetailValues = ({id, name, value, status, onInputChange, fnSave, onResetForm }) => {
  return (
    <Card className='mb-3'>
    <CardBody>
      <Row>
        <Colxx xxs="12">
          <CardTitle>{IntlMessages("page.defaultValues.title.detail")}</CardTitle>
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xss="12" xs="6" lg="6">
          <InputField 
           name="name"
           type="text"
           value={name}
           onChange={onInputChange}
           label="page.defaultValues.input.input.name"
           />
        </Colxx>
        <Colxx xss="12" xs="6" lg="6">
          <Checkbox
            name="status"
            value={status}
            onChange={onInputChange}
            label="check.status"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xss="12" xs="6" lg="12">
          <InputField 
           name="value"
           type="text"
           value={value}
           onChange={onInputChange}
           label="page.defaultValues.input.input.value"
           />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" align="right">
          <Button 
            color="secondary" onClick={onResetForm} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}
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

export default DetailValues