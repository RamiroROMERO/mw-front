import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from '@Components/simpleSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';

// Modal "Reportes" (cont_cxp_print.sc2): NO ejecuta la lógica del reporte, solo elige una
// de 3 variantes (Detallado / Hasta la Fecha / Saldos Vencidos) y, para las últimas dos, una
// fecha de corte — igual que el legacy (Optiongroup_hw1 + Textbox_hw1 visible solo para
// opciones 2/3). Quien corre la consulta real es useAccountsToPay (findDetailReport en el
// backend), igual que el legacy delega en Thisform.verReporte de cont_cxp.sc2.
const ModalReports = ({ data, setOpen }) => {
  const { mode, date, onInputChange, fnPrint, fnExportXlsx } = data;

  const modeOptions = [
    { id: '1', name: IntlMessages('page.accountsToPay.modal.reports.mode.detailed') },
    { id: '2', name: IntlMessages('page.accountsToPay.modal.reports.mode.asOfDate') },
    { id: '3', name: IntlMessages('page.accountsToPay.modal.reports.mode.overdue') }
  ];
  const showDate = mode === '2' || mode === '3';

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              name="mode"
              label="page.accountsToPay.modal.reports.mode"
              value={mode}
              onChange={onInputChange}
              options={modeOptions}
              getOptionValue={(o) => o.id}
              getOptionLabel={(o) => o.name}
            />
          </Colxx>
        </Row>
        {showDate && (
          <Row>
            <Colxx xxs="12">
              <DateCalendar
                name="date"
                label="page.accountsToPay.modal.reports.date"
                value={date}
                onChange={onInputChange}
              />
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={fnPrint}>
          <i className="iconsminds-printer" /> {IntlMessages('button.print')}
        </Button>
        <Button color="secondary" onClick={fnExportXlsx}>
          <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalReports
