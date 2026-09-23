import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

const ModalTrace = ({ data, setOpen }) => {
  const { trace, formatNumber, formatDate } = data;

  if (!trace) return null;
  const { providerName, documentCode, type, invoiceDate, dueDate, originalValue, composition, payments, totalPaid, balance } = trace;

  const table = {
    columns: [
      {
        text: IntlMessages('table.column.date'),
        dataField: 'date',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '')
      },
      { text: IntlMessages('page.cxpInvoiceTrace.table.docType'), dataField: 'docType', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.cxpInvoiceTrace.table.reference'), dataField: 'reference', headerStyle: { width: '18%' } },
      { text: IntlMessages('page.cxpInvoiceTrace.table.paymentType'), dataField: 'paymentType', headerStyle: { width: '25%' } },
      {
        text: IntlMessages('page.cxpInvoiceTrace.table.paidValue'),
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
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.provider')}:</strong> {providerName}
          </Colxx>
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.document')}:</strong> {documentCode}
          </Colxx>
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.type')}:</strong> {type || '-'}
          </Colxx>
        </Row>
        <Row className="mb-3">
          <Colxx xxs="4" sm="3">
            <strong>{IntlMessages('table.column.date')}:</strong> {formatDate(invoiceDate)}
          </Colxx>
          <Colxx xxs="4" sm="3">
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.dueDate')}:</strong> {dueDate ? formatDate(dueDate) : ''}
          </Colxx>
          <Colxx xxs="4" sm="3">
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.originalValue')}:</strong> {formatNumber(originalValue)}
          </Colxx>
        </Row>
        {composition && (
          <Row className="mb-3">
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxpInvoiceTrace.table.subtotal')}:</strong> {formatNumber(composition.subtotal)}
            </Colxx>
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxpInvoiceTrace.table.discount')}:</strong> {formatNumber(composition.discount)}
            </Colxx>
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxpInvoiceTrace.table.tax')}:</strong> {formatNumber(composition.tax)}
            </Colxx>
            <Colxx xxs="6" sm="3">
              <strong>{IntlMessages('page.cxpInvoiceTrace.table.total')}:</strong> {formatNumber(composition.total)}
            </Colxx>
          </Row>
        )}
        <Row>
          <Colxx xxs="12">
            <h6>{IntlMessages('page.cxpInvoiceTrace.table.paymentsTitle')}</h6>
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.totalPaid')}:</strong> {formatNumber(totalPaid)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages('page.cxpInvoiceTrace.table.balance')}:</strong> {formatNumber(balance)}
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
