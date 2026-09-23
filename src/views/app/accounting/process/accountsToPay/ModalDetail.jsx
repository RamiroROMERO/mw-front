import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Detalle por factura (cont_cxpdeta.sc2, doble-click en el legacy sobre cont_cxp.sc2). Reutiliza
// findPendingByProvider (Fase 2, dailyItems) + un panel de solo lectura de "Adelantos
// Disponibles" (aplicar un adelanto puntual, "Distribuir" en el legacy, queda diferido junto
// con la pantalla propia de Adelantos a Proveedores).
const ModalDetail = ({ data, setOpen }) => {
  const { detail, agingBuckets, formatNumber, formatDate, fnPrint, fnExportXlsx } = data;

  if (!detail) return null;
  const { providerId, providerName, rows, aging, total, advances } = detail;

  const table = {
    columns: [
      { text: IntlMessages('page.accountsToPay.table.document'), dataField: 'documentCode', headerStyle: { width: '20%' } },
      {
        text: IntlMessages('table.column.date'),
        dataField: 'date',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '')
      },
      {
        text: IntlMessages('page.accountsToPay.table.dueDate'),
        dataField: 'dueDate',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (row.original.dueDate ? formatDate(row.original.dueDate) : '')
      },
      {
        text: IntlMessages('page.accountsToPay.table.originalValue'),
        dataField: 'originalValue',
        headerStyle: { width: '25%' },
        cell: ({ row }) => formatNumber(row.original.originalValue)
      },
      {
        text: IntlMessages('page.accountsToPay.table.balance'),
        dataField: 'balance',
        headerStyle: { width: '25%' },
        cell: ({ row }) => formatNumber(row.original.balance)
      }
    ],
    data: rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const advancesTable = {
    columns: [
      {
        text: IntlMessages('page.accountsToPay.detail.advances.date'),
        dataField: 'date',
        headerStyle: { width: '20%' },
        cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '')
      },
      { text: IntlMessages('page.accountsToPay.detail.advances.description'), dataField: 'description', headerStyle: { width: '40%' } },
      {
        text: IntlMessages('page.accountsToPay.detail.advances.originalValue'),
        dataField: 'originalValue',
        headerStyle: { width: '20%' },
        cell: ({ row }) => formatNumber(row.original.originalValue)
      },
      {
        text: IntlMessages('page.accountsToPay.detail.advances.balance'),
        dataField: 'balance',
        headerStyle: { width: '20%' },
        cell: ({ row }) => formatNumber(row.original.balance)
      }
    ],
    data: advances || [],
    options: { pageSize: 5 }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('table.column.code')}:</strong> {providerId}
          </Colxx>
          <Colxx xxs="12" sm="6">
            <strong>{IntlMessages('page.accountsToPay.table.provider')}:</strong> {providerName}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className="div-action-button-container mb-2">
            <Button color="secondary" onClick={fnPrint}>
              <i className="iconsminds-printer" /> {IntlMessages('button.print')}
            </Button>
            <Button color="secondary" onClick={fnExportXlsx}>
              <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          {agingBuckets.map((bucket) => (
            <Colxx xxs="6" sm="4" md="2" className="text-end mb-2" key={bucket.field}>
              <strong>{IntlMessages(bucket.label)}:</strong><br />{formatNumber(aging[bucket.field])}
            </Colxx>
          ))}
          <Colxx xxs="12" sm="4" md="2" className="text-end mb-2">
            <strong>{IntlMessages('page.accountsToPay.table.total')}:</strong><br />{formatNumber(total)}
          </Colxx>
        </Row>
        {advances && advances.length > 0 && (
          <Row className="mt-3">
            <Colxx xxs="12">
              <h6>{IntlMessages('page.accountsToPay.detail.advances.title')}</h6>
              <ReactTable {...advancesTable} />
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalDetail
