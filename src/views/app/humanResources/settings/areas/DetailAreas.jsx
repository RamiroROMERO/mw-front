import React from 'react';
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils'
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';

const DetailAreas = ({name, bossId, idCtaRrhhSeverance, idCtaRrhhNotice, idCtaRrhhVacation, idCtaRrhhThirteenth, idCtaRrhhFourteenth, status, listBossId, onResetForm, fnSave, onInputChange, listAccount}) => {
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
              label="page.areas.input.description"
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <SearchSelect
              name="bossId"
              inputValue={ bossId}
              onChange={onInputChange}
              options={listBossId}
              label="page.areas.select.headofarea"
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <SearchSelect
              name="idCtaRrhhSeverance"
              inputValue={idCtaRrhhSeverance}
              onChange={onInputChange}
              options={listAccount}
              label="page.areas.select.idCtaRrhhSeverance"
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <SearchSelect
              name="idCtaRrhhNotice"
              inputValue={idCtaRrhhNotice}
              onChange={onInputChange}
              options={listAccount}
              label="page.areas.select.idCtaRrhhNotice"
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <SearchSelect
              name="idCtaRrhhVacation"
              inputValue={idCtaRrhhVacation}
              onChange={onInputChange}
              options={listAccount}
              label="page.areas.select.idCtaRrhhVacation"
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <SearchSelect
              name="idCtaRrhhThirteenth"
              inputValue={idCtaRrhhThirteenth}
              onChange={onInputChange}
              options={listAccount}
              label="page.areas.select.idCtaRrhhThirteenth"
            />
          </Colxx>
          <Colxx  xss="12" xs="6" lg="12">
            <SearchSelect
              name="idCtaRrhhFourteenth"
              inputValue={idCtaRrhhFourteenth}
              onChange={onInputChange}
              options={listAccount}
              label="page.areas.select.idCtaRrhhFourteenth"
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="12">
            <Checkbox
              name ="status"
              value={status}
              onChange={onInputChange}
              label="check.status"
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
};

export default DetailAreas