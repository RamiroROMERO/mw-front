import React from 'react'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils';
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { Checkbox } from '@Components/checkbox';

const DetailJobPosition = ({levelId, name, description, maxHours, status, fnFormLevel, fnSave, onInputChange, listLevel, formValidation, sendForm, fnClearInputs}) =>{

  const { levelIdValid, nameValid, maxHoursValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row className='mb-3'>
          <Colxx xss="12" xs="6" lg="12">
            <SearchSelect
              name="levelId"
              inputValue={levelId}
              label="page.jobPositions.select.level"
              onChange={onInputChange}
              options={listLevel}
              invalid={sendForm && !!levelIdValid}
              feedbackText={sendForm && (levelIdValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="name"
              onChange={onInputChange}
              value={name}
              label="input.name"
              type="text"
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="description"
              onChange={onInputChange}
              value={description}
              label="page.jobPositions.input.description"
              type="textarea"
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <InputField
              name="maxHours"
              onChange={onInputChange}
              value={maxHours}
              label="page.jobPositions.input.maxHours"
              type="number"
              invalid={sendForm && !!maxHoursValid}
              feedbackText={sendForm && (maxHoursValid || null)}
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
              color="success" onClick={fnFormLevel} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.level")}
            </Button>
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

export default DetailJobPosition