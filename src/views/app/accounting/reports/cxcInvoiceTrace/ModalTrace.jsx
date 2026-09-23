import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

const ModalTrace = ({ data, setOpen }) => {
  const { trace, formatNumber, formatDate } = data;

  if (!trace) return null;
  const { customerName, documentCode, typeDescription, invoiceDate, dueDate, originalValue, composition, payments, totalPaid, balance } = trace;

  const table = {
    columns: [
      {
        text: IntlMessages('table.column.date'),
        dataField: 'date',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '')
      },
      { text: IntlMessages('page.cxcInvoiceTrace.table.docType'), dataField: 'docType', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.reference'), dataField: 'reference', headerStyle: { width: '18%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.paymentType'), dataField: 'paymentType', headerStyle: { width: '25%' } },
      {
        text: IntlMessages('page.cxcInvoiceTrace.table.paidValue'),
        dataField: 'paidValue',
        headerStyle: { width: '15%' },
        cell: ({ row }) => formatNumber(row.original.paidValue)
      }
    ],
    data: payments,
    options: { pageSize: 10 }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12" sm="6">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.customer')}:</strong> {customerName}
          </Colxx>
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.document')}:</strong> {documentCode}
          </Colxx>
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.type')}:</strong> {typeDescription}
          </Colxx>
        </Row>
        <Row className="mb-3">
          <Colxx xxs="4" sm="3">
            <strong>{IntlMessages('table.column.date')}:</strong> {formatDate(invoiceDate)}
          </Colxx>
          <Colxx xxs="4" sm="3">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.dueDate')}:</strong> {dueDate ? formatDate(dueDate) : ''}
          </Colxx>
          <Colxx xxs="4" sm="3">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.originalValue')}:</strong> {formatNumber(originalValue)}
          </Colxx>
        </Row>
        {composition && (
          <Row className="mb-3">
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxcInvoiceTrace.table.subtotal')}:</strong> {formatNumber(composition.subtotal)}
            </Colxx>
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxcInvoiceTrace.table.discount')}:</strong> {formatNumber(composition.discount)}
            </Colxx>
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxcInvoiceTrace.table.tax')}:</strong> {formatNumber(composition.tax)}
            </Colxx>
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxcInvoiceTrace.table.total')}:</strong> {formatNumber(composition.total)}
            </Colxx>
          </Row>
        )}
        <Row>
          <Colxx xxs="12">
            <h6>{IntlMessages('page.cxcInvoiceTrace.table.paymentsTitle')}</h6>
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.totalPaid')}:</strong> {formatNumber(totalPaid)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages('page.cxcInvoiceTrace.table.balance')}:</strong> {formatNumber(balance)}
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

export default ModalTrace
