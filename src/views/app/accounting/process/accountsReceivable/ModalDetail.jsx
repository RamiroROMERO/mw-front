import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Detalle por factura (cont_cxcdeta.sc2, doble-click en el legacy sobre cont_cxc.sc2). Reutiliza
// el endpoint pendingByCustomer ya existente (findPendingByCustomer, construido en Fase 2 para
// dailyItems). El resumen de antigüedad se calcula en el cliente (useAccountsReceivable.fnOpenDetail)
// sobre las mismas filas, sin ida y vuelta adicional al backend.
const ModalDetail = ({ data, setOpen }) => {
  const { detail, agingBuckets, formatNumber, formatDate, fnPrint, fnExportXlsx } = data;

  if (!detail) return null;
  const { customerId, customerName, rows, aging, total } = detail;

  const table = {
    columns: [
      { text: IntlMessages('page.accountsReceivable.table.document'), dataField: 'documentCode', headerStyle: { width: '20%' } },
      {
        text: IntlMessages('table.column.date'),
        dataField: 'date',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '')
      },
      {
        text: IntlMessages('page.accountsReceivable.table.dueDate'),
        dataField: 'dueDate',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (row.original.dueDate ? formatDate(row.original.dueDate) : '')
      },
      {
        text: IntlMessages('page.accountsReceivable.table.originalValue'),
        dataField: 'originalValue',
        headerStyle: { width: '25%' },
        cell: ({ row }) => formatNumber(row.original.originalValue)
      },
      {
        text: IntlMessages('page.accountsReceivable.table.balance'),
        dataField: 'balance',
        headerStyle: { width: '25%' },
        cell: ({ row }) => formatNumber(row.original.balance)
      }
    ],
    data: rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('table.column.code')}:</strong> {customerId}
          </Colxx>
          <Colxx xxs="12" sm="6">
            <strong>{IntlMessages('page.accountsReceivable.table.customer')}:</strong> {customerName}
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
            <strong>{IntlMessages('page.accountsReceivable.table.total')}:</strong><br />{formatNumber(total)}
          </Colxx>
        </Row>
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
