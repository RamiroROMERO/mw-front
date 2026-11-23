import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@Components/checkbox';
import ReactTable from '@Components/reactTable';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import { summaryColumns } from './cashReportRules';

// Resumen de cobros por caja, cajero y/o forma de pago (SPEC v2-108-sr): elige al menos una agrupación; usa las fechas y los filtros del encabezado (antes resumía todo el
// historial). "Ver Reporte" lee del back; Exportar (Excel) e Imprimir (PDF) bajan el mismo reporte.
const ModalSummary = ({ data, setOpen }) => {
  const { formState, errors, sendForm, onInputChange, summary, downloading, onView, onExport, onPrint } = data;
  const intl = useIntl();
  const { byCash, byCashier, byPaymentType } = formState;

  const table = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(summaryColumns({ byCash, byCashier, byPaymentType }), intl.formatMessage),
    data: summary.rows,
    actions: []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [summary.rows, byCash, byCashier, byPaymentType, intl.locale]);

  return (
    <>
      <ModalBody>
        <Row className='mb-3'>
          <Colxx xxs="12" md="9" className="d-flex align-items-center flex-wrap">
            <div className="me-4"><Checkbox label="select.cashId" name="byCash" value={byCash} onChange={onInputChange} /></div>
            <div className="me-4"><Checkbox label="page.boxesReport.select.cashierId" name="byCashier" value={byCashier} onChange={onInputChange} /></div>
            <div className="me-4"><Checkbox label="select.paymentMethod" name="byPaymentType" value={byPaymentType} onChange={onInputChange} /></div>
            {sendForm && errors.summary && <div className="text-danger small w-100">{intl.formatMessage({ id: errors.summary })}</div>}
          </Colxx>
          <Colxx xxs="12" md="3" className="div-action-button-container">
            <Button color="primary" onClick={() => { onView() }}>
              <i className='bi bi-search' /> {IntlMessages("button.viewReport")}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" disabled={downloading} onClick={() => { onExport() }}>
          <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.export")}
        </Button>
        <Button color="dark" disabled={downloading} onClick={() => { onPrint() }}>
          <i className='bi bi-printer' /> {IntlMessages("button.print")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSummary
