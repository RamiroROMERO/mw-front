import React from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields'
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from '@Components/simpleSelect';
import { Checkbox } from '@Components/checkbox';

const DetailOvertime = ({ journalId, percentValue, hourInit, hourEnd, status, listWorkingDay, fnSave, fnClearInputs,
  onInputChange, formValidation, sendForm}) =>{

  const { journalIdValid, percentValueValid, hourInitValid, hourEndValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row className='mb-3'>
          <Colxx xss="12" xs="6" lg="12">
            <SimpleSelect
              name="journalId"
              value={journalId}
              onChange={onInputChange}
              options={listWorkingDay}
              label="page.overtime.select.workingDay"
              invalid={sendForm && !!journalIdValid}
              feedbackText={sendForm && (journalIdValid || null)}
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <InputField
              name="percentValue"
              value={percentValue}
              onChange={onInputChange}
              type="number"
              label="page.overtime.input.percentValue"
              invalid={sendForm && !!percentValueValid}
              feedbackText={sendForm && (percentValueValid || null)}
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <InputField
              name="hourInit"
              value={hourInit}
              onChange={onInputChange}
              type="time"
              label="page.overtime.input.startTime"
              invalid={sendForm && !!hourInitValid}
              feedbackText={sendForm && (hourInitValid || null)}
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <InputField
              name="hourEnd"
              value={hourEnd}
              onChange={onInputChange}
              type="time"
              label="page.overtime.input.endTime"
              invalid={sendForm && !!hourEndValid}
              feedbackText={sendForm && (hourEndValid || null)}
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="6">
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
              color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailOvertime