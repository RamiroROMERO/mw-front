import { useMemo } from "react";
import { formatDate, formatNumber, IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";
import { INVOICES_PATH, invoiceState } from "./posCaptureRules";

// Facturas del POS (SPEC v2-80-sr): por páginas en el servidor, por defecto las del día de la sesión; el cajero ve solo las suyas y el supervisor todas. Solo lectura:
// abrir una factura la muestra bloqueada.
const ModalSeekPosInvoices = (props) => {
  const { data, setOpen } = props;
  const { sessionId, fnSelect } = data;

  const stateText = {
    voided: IntlMessages("page.invoicing.state.voided"),
    closed: IntlMessages("page.pointSales.state.closed"),
    issued: IntlMessages("page.invoicing.state.fiscal")
  };
  const textDate = IntlMessages("page.invoicing.table.date");
  const textNumber = IntlMessages("page.invoicing.table.number");
  const textInvoice = IntlMessages("page.invoicing.table.invoice");
  const textCustomer = IntlMessages("page.invoicing.table.customer");
  const textState = IntlMessages("page.invoicing.table.state");
  const textValue = IntlMessages("page.invoicing.table.value");
  const textDoc = IntlMessages("page.invoicing.table.doc");
  const textPayment = IntlMessages("page.pointSales.table.payment");

  const columns = useMemo(() => [
    { text: textDate, dataField: "date", headerStyle: { 'width': '12%' }, cell: ({ row }) => formatDate(row.original.date) },
    { text: textNumber, dataField: "documentId", headerStyle: { 'width': '9%' }, classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell' },
    { text: textInvoice, dataField: "fiscalNumber", headerStyle: { 'width': '16%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' },
    { text: textCustomer, dataField: "customerName", headerStyle: { 'width': '20%' } },
    { text: textPayment, dataField: "paymentNames", headerStyle: { 'width': '13%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' },
    { text: textState, dataField: "state", headerStyle: { 'width': '10%' }, cell: ({ row }) => stateText[invoiceState(row.original)] },
    { text: textValue, dataField: "total", headerStyle: { width: '10%' }, style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.total) },
    { text: textDoc, dataField: "documentCode", headerStyle: { 'width': '5%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [textDate, textNumber, textInvoice, textCustomer, textPayment, textState, textValue, textDoc, stateText.voided, stateText.closed, stateText.issued]);

  const config = useMemo(() => ({
    url: INVOICES_PATH, columns, onSelect: fnSelect, extraParams: { sessionId }, pageSize: 50, closeOnSelect: true
  }), [columns, fnSelect, sessionId]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSeekPosInvoices;
