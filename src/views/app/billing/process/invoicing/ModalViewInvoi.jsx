import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";
import { formatDate } from "@Helpers/Utils";

const ModalViewInvoi = (props) => {
  const { data, setOpen } = props;
  const { dataInvoicing } = data;

  // Los textos del estado se piden aquí, siempre y en el mismo orden (un hook dentro de la celda cambiaría el orden de los hooks).
  const stateText = {
    voided: IntlMessages("page.invoicing.state.voided"),
    fiscal: IntlMessages("page.invoicing.state.fiscal"),
    draft: IntlMessages("page.invoicing.state.draft")
  };
  // Estado de pago de las facturas fiscales (SPEC v2-73-sr, desde la CxC en el servidor).
  const paymentText = {
    paid: IntlMessages("page.invoicing.paymentStatus.paid"),
    pending: IntlMessages("page.invoicing.paymentStatus.pending")
  };

  const [table] = useState({
    title: IntlMessages("page.invoicing.table.title"),
    columns: [
      {
        text: IntlMessages("page.invoicing.table.date"), dataField: "date", headerStyle: { 'width': '15%' },
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.invoicing.table.number"), dataField: "documentId", headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("page.invoicing.table.invoice"), dataField: "numcai", headerStyle: { 'width': '18%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      { text: IntlMessages("page.invoicing.table.customer"), dataField: "customerName", headerStyle: { 'width': '18%' } },
      {
        text: IntlMessages("page.invoicing.table.state"), dataField: "stateKey", headerStyle: { 'width': '14%' },
        cell: ({ row }) => [stateText[row.original.stateKey], row.original.stateKey === 'fiscal' ? paymentText[row.original.paymentStatus] : ''].filter(Boolean).join(' · ')
      },
      { text: IntlMessages("page.invoicing.table.value"), dataField: "value", headerStyle: { width: '10%' }, style: { textAlign: 'right' } },
      {
        text: IntlMessages("page.invoicing.table.doc"), dataField: "documentCode", headerStyle: { 'width': '5%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' }, style: { textAlign: 'right' } }
    ],
    data: dataInvoicing,
    actions: []
  });

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
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalViewInvoi;