import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import { IntlMessages } from '@/helpers/Utils';
import { Button, Row } from 'reactstrap';

const HeaderReport = ({formState, onInputChange, fnSearchReport }) => {
  const { startDate, endDate } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" xs="6" md="4">
          <DateCalendar
            name="startDate"
            label='select.dateStart'
            value={startDate}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="4">
          <DateCalendar
            name="endDate"
            label='select.dateEnd'
            value={endDate}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={() => { fnSearchReport() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport