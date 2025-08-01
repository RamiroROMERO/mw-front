import React from 'react'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils';
import {Button, Card, Row, CardBody, CardTitle} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';
import { SimpleSelect } from '@Components/simpleSelect';

const DetailSchedules = ({ name, d1Status, d1HourIn, d1HourOut, d2Status, d2HourIn, d2HourOut, d3Status, d3HourIn, d3HourOut, d4Status, d4HourIn, d4HourOut, d5Status, d5HourIn, d5HourOut, d6Status, d6HourIn, d6HourOut, d7Status, d7HourIn, d7HourOut, timeOffIn, timeOffOut, nightly, breaktimeIn, breaktimeOut, color, status, onInputChange, onResetForm, fnSave}) => {

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row className='mb-2'>
          <Colxx xss="12" xs="6" lg="8">
            <InputField
              name="name"
              value={name}
              onChange={onInputChange}
              type="text"
              label="page.schedules.input.name"
            />
          </Colxx>
           <Colxx xss="12" xs="6" lg="4">
            <Checkbox
              name="status"
              value={status}
              onChange={onInputChange}
              label="check.status"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <CardTitle>{IntlMessages("page.schedules.title.detail")}</CardTitle>
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
              name="d1Status"
              value={d1Status}
              onChange={onInputChange}
              label="page.schedules.checkbox.monday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d1HourIn"
              value={d1HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d1HourOut"
              value={d1HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="d2Status"
            value={d2Status}
            onChange={onInputChange}
            label="page.schedules.checkbox.tuesday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d2HourIn"
              value={d2HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d2HourOut"
              value={d2HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="d3Status"
            value={d3Status}
            onChange={onInputChange}
            label="page.schedules.checkbox.wednesday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d3HourIn"
              value={d3HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d3HourOut"
              value={d3HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="d4Status"
            value={d4Status}
            onChange={onInputChange}
            label="page.schedules.checkbox.thursday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d4HourIn"
              value={d4HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d4HourOut"
              value={d4HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="d5Status"
            value={d5Status}
            onChange={onInputChange}
            label="page.schedules.checkbox.friday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d5HourIn"
              value={d5HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d5HourOut"
              value={d5HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="d6Status"
            value={d6Status}
            onChange={onInputChange}
            label="page.schedules.checkbox.saturday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d6HourIn"
              value={d6HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d6HourOut"
              value={d6HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="d7Status"
            value={d7Status}
            onChange={onInputChange}
            label="page.schedules.checkbox.sunday"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d7HourIn"
              value={d7HourIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.entry"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="d7HourOut"
              value={d7HourOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.exit"
            />
          </Colxx>
        </Row>
        <Row className='mb-2'>
          <Colxx xss="12" xs="4" lg="4">
            <Checkbox
            name="nightly"
            value={nightly}
            onChange={onInputChange}
            label="page.schedules.checkbox.nightly"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="breaktimeOut"
              value={breaktimeOut}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.breaktimeOut"
            />
          </Colxx>
          <Colxx xss="12" xs="4" lg="4">
            <InputField
              name="breaktimeIn"
              value={breaktimeIn}
              type="time"
              onChange={onInputChange}
              label= "page.schedules.input.breaktimeIn"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xss="12" xs="6" lg="6">
            <InputField
              name="timeOffIn"
              value={timeOffIn}
              onChange={onInputChange}
              type="number"
              label="page.schedules.input.timeOffIn"
            />
          </Colxx>
          <Colxx xss="12" xs="6" lg="6">
            <InputField
              name="timeOffOut"
              value={timeOffOut}
              onChange={onInputChange}
              type="number"
              label="page.schedules.input.timeOffOut"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} sm={5} md={12}>
            <SimpleSelect
              name="color"
              label='select.colorInCalendar'
              value={color}
              onChange={onInputChange}
              options={[
                {id:'#145388',name:'Azul'},
                {id:'#6fb327',name:'Verde'},
                {id:'#c2185b',name:'Rosado'},
                {id:'#ed7117',name:'Anaranjado'},
                {id:'#900604',name:'Rojo'},
                {id:'#c0a145',name:'Amarillo'},
                {id:'#922c88',name:'Morado'},
                {id:'#6d4c41',name:'Cafe'}
              ]}
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

export default DetailSchedules;