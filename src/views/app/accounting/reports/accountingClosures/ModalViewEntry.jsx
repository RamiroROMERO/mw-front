import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Drill-down de solo lectura de una de las 3 partidas generadas por un cierre — mejora
// no-legacy (el legacy solo muestra el número de partida como texto en la grilla).
const ModalViewEntry = ({ data, setOpen }) => {
  const { entry, formatNumber, formatDate } = data;

  if (!entry) return null;
  const { header, lines } = entry;

  const table = {
    columns: [
      { text: IntlMessages('page.accountingClosures.modal.viewEntry.accountNumber'), dataField: 'accountNumber', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.accountingClosures.modal.viewEntry.accountName'), dataField: 'accountName', headerStyle: { width: '45%' } },
      {
        text: IntlMessages('page.accountingClosures.modal.viewEntry.debit'),
        dataField: 'debit',
        headerStyle: { width: '20%' },
        cell: ({ row }) => formatNumber(row.original.debit)
      },
      {
        text: IntlMessages('page.accountingClosures.modal.viewEntry.credit'),
        dataField: 'credit',
        headerStyle: { width: '20%' },
        cell: ({ row }) => formatNumber(row.original.credit)
      }
    ],
    data: lines,
    options: { pageSize: 10 }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('page.accountingClosures.table.numpda')}:</strong> {header.numberPDA}
          </Colxx>
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages('table.column.date')}:</strong> {formatDate(header.date)}
          </Colxx>
          <Colxx xxs="12" sm="6">
            <strong>{IntlMessages('table.column.description')}:</strong> {header.description}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages('page.accountingClosures.modal.viewEntry.debit')}:</strong> {formatNumber(header.totalDebit)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages('page.accountingClosures.modal.viewEntry.credit')}:</strong> {formatNumber(header.totalCredit)}
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

export default ModalViewEntry
