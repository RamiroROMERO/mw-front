import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { Checkbox } from '@/components/checkbox'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { IntlMessages } from '@/helpers/Utils'
import { SimpleSelect } from '@/components/simpleSelect'

export const Detail = ({formState, lists, onInputChange, formValidation, fnSave, fnClear, sendForm}) => {

  const {companyList, areaList} = lists;
  const {companyId, areaId, name, status} = formState;

  const {companyIdValid, areaIdValid, nameValid} = formValidation;

  return (
    <>
    <Card>
      <CardBody>
    <Row>
      <Colxx xxs={12}>
        <SimpleSelect 
          name="companyId"
          value={companyId}
          label= "pages.select.companyId"
          onChange={onInputChange}
          options={companyList}
          invalid={sendForm && !!companyIdValid}
          feedbackText={sendForm && (companyIdValid || null)}
        />
      </Colxx>
      <Colxx xxs={12}>
        <SimpleSelect 
          name="areaId"
          label="pages.select.areaId"
          value={areaId}
          onChange={onInputChange}
          options={areaList}
          invalid={sendForm && !!areaIdValid}
          feedbackText={sendForm && (areaIdValid || null)}
        />
      </Colxx>
    </Row>
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
    </Row>
    <Row>
    <Colxx xxs={12} align="right">
        <Checkbox 
          name="status"
          label="check.status"
          value={status}
          onChange={onInputChange}
        />
      </Colxx>
    </Row>
    <hr />
    <Row>
      <Colxx xxs="12" className="div-action-button-container">
        <Button
          color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
        </Button>
        <Button
          color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
      </Colxx>
      </Row>
    </CardBody>
    </Card>
    </>
  )
}
