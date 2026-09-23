import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import ReactTable from '@Components/reactTable';

// Drill-down de solo lectura del Libro Diario ("Ver Partida" — doble-click en el legacy).
const ModalViewEntry = ({ data, setOpen }) => {
  const { entry, formatNumber, formatDate } = data;

  if (!entry) return null;
  const { header, lines } = entry;

  const table = {
    columns: [
      { text: IntlMessages("page.diaryBook.table.accountNumber"), dataField: "accountNumber", headerStyle: { width: "15%" } },
      { text: IntlMessages("page.diaryBook.table.accountName"), dataField: "accountName", headerStyle: { width: "35%" } },
      { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { width: "25%" } },
      {
        text: IntlMessages("page.diaryBook.table.debit"),
        dataField: "debit",
        headerStyle: { width: "12.5%" },
        cell: ({ row }) => formatNumber(row.original.debit)
      },
      {
        text: IntlMessages("page.diaryBook.table.credit"),
        dataField: "credit",
        headerStyle: { width: "12.5%" },
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
            <strong>{IntlMessages("page.diaryBook.table.numberPDA")}:</strong> {header.numberPDA}
          </Colxx>
          <Colxx xxs="6" sm="3">
            <strong>{IntlMessages("table.column.date")}:</strong> {formatDate(header.date)}
          </Colxx>
          <Colxx xxs="12" sm="6">
            <strong>{IntlMessages("table.column.description")}:</strong> {header.description}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages("page.diaryBook.table.debit")}:</strong> {formatNumber(header.totalDebit)}
          </Colxx>
          <Colxx xxs="6" sm="3" className="text-end">
            <strong>{IntlMessages("page.diaryBook.table.credit")}:</strong> {formatNumber(header.totalCredit)}
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
