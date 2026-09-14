import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { Button, Row } from 'reactstrap';
import { SimpleSelect } from '@Components/simpleSelect';

const HeaderDash = ({ reportId, setReportId, noYear, setNoYear, listYears, fnSearchDash }) => {
  // El año solo aplica al reporte "Ventas Mensuales" (opción 1) — los otros dos
  // reportes usan una ventana móvil de fechas (últimos 6/12 meses), igual que
  // Combobox_hw2.Enabled en el legacy (Combobox_hw1.InteractiveChange).
  const yearSelectEnabled = String(reportId) === '1';

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
            disabled={!yearSelectEnabled}
            options={listYears.map((year) => ({ id: year, name: String(year) }))}
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
        <Colxx xxs={12} xs={6} md={6} className="div-action-button-container" style={{height: 'fit-content'}}>
          <Button color="primary" onClick={() => { fnSearchDash() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderDash