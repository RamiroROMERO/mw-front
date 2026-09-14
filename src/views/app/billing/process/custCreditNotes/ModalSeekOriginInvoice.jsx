import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';
import TableButton from '@Components/tableButtons';

const ModalSeekOriginInvoice = ({ data, setOpen }) => {
  const { dataInvoices, fnSelect } = data;

  const rows = dataInvoices.map((item) => ({
    ...item,
    value: formatNumber(item.total),
    options: <TableButton color='primary' icon='eye' fnOnClick={() => fnSelect(item)} />
  }));

  const table = {
    title: IntlMessages("page.custCreditNotes.modal.originInvoice.table.title"),
    columns: [
      { text: IntlMessages("page.invoicing.table.date"), dataField: "date", headerStyle: { width: '15%' }, cell: ({ row }) => formatDate(row.original.date) },
      { text: IntlMessages("page.invoicing.table.number"), dataField: "documentId", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.invoicing.table.invoice"), dataField: "numcai", headerStyle: { width: '35%' } },
      { text: IntlMessages("page.invoicing.table.value"), dataField: "value", headerStyle: { width: '15%' }, style: { textAlign: 'right' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { width: '15%' }, style: { textAlign: 'right' } }
    ],
    data: rows,
    actions: []
  };

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}
export default ModalSeekOriginInvoice;
