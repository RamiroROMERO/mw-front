import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import { IntlMessages } from '@/helpers/Utils';
import { Button, Row } from 'reactstrap';
import { SimpleSelect } from '@/components/simpleSelect';

const HeaderDash = ({ reportId, setReportId, noYear, setNoYear, fnSearchDash }) => {

  return (
    <>
      <Row>
        <Colxx xxs={12} xs={6} md={4}>
          <SimpleSelect
            name="reportName"
            label="button.report"
            value={reportId}
            onChange={({ target }) => setReportId(target.value)}
            options={[{ id: 1, name: 'Ventas Mensuales' }, { id: 2, name: 'Ultimo Año' }, { id: 3, name: 'Ultimos 6 meses' }]}
          />
        </Colxx>
        <Colxx xxs={12} xs={6} md={2}>
          <SimpleSelect
            name="noYear"
            label="table.column.year"
            value={noYear}
            onChange={({ target }) => setNoYear(target.value)}
            options={[{ id: 2025, name: '2025' }, { id: 2024, name: '2024' }, { id: 2023, name: '2023' }]}
          />
        </Colxx>


        {/* <Colxx xxs="12" xs="6" md="4">
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
        </Colxx> */}
        <Colxx xxs="12" xs="6" md="4" className="div-action-button-container">
          <Button color="primary" onClick={() => { fnSearchDash() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderDash