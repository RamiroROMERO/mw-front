import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';
import TableButton from '@Components/tableButtons';

const TYPE_LABELS = {
  1: 'page.custCreditNotes.radio.discount',
  2: 'page.custCreditNotes.radio.cancellation',
  3: 'page.custCreditNotes.radio.return',
  4: 'page.custCreditNotes.radio.other'
};

const ModalSeekCreditNotes = ({ data, setOpen }) => {
  const { dataCreditNotes, fnView } = data;

  const rows = dataCreditNotes.map((item) => ({
    ...item,
    clientName: item.clientData ? item.clientData.nomcli : '',
    typeName: IntlMessages(TYPE_LABELS[item.typeId] || ''),
    value: formatNumber(item.valueLps),
    options: <TableButton color='primary' icon='eye' fnOnClick={() => fnView(item)} />
  }));

  const table = {
    title: IntlMessages("page.custCreditNotes.modal.search.title"),
    columns: [
      { text: IntlMessages("page.invoicing.table.date"), dataField: "date", headerStyle: { width: '12%' }, cell: ({ row }) => formatDate(row.original.date) },
      { text: IntlMessages("page.invoicing.table.number"), dataField: "documentId", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.invoicing.table.invoice"), dataField: "numberCAI", headerStyle: { width: '18%' } },
      { text: IntlMessages("page.invoicing.table.customer"), dataField: "clientName", headerStyle: { width: '25%' } },
      { text: IntlMessages("page.custCreditNotes.title.type"), dataField: "typeName", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.invoicing.table.value"), dataField: "value", headerStyle: { width: '10%' }, style: { textAlign: 'right' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { width: '10%' }, style: { textAlign: 'right' } }
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
export default ModalSeekCreditNotes;
