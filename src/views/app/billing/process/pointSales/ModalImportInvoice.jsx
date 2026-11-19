import { useMemo } from "react";
import { formatDate, formatNumber, IntlMessages } from "@Helpers/Utils";
import { ModalSearchContent } from "@Components/modalSearch";
import notification from "@Containers/ui/Notifications";
import { IMPORT_LIST_PATH, canImportRow } from "./posImportRules";

// Borradores de Facturación para cobrar en la caja (SPEC v2-90-sr): por páginas en el servidor, con búsqueda por cliente, orden de compra o número. Una factura a Crédito se
// muestra deshabilitada y no se abre (se cobra con un recibo de cancelación).
const ModalImportInvoice = (props) => {
  const { data, setOpen } = props;
  const { sessionId, fnSelect } = data;

  const textDate = IntlMessages("page.invoicing.table.date");
  const textCustomer = IntlMessages("page.invoicing.table.customer");
  const textOrder = IntlMessages("page.pointSales.import.table.order");
  const textValue = IntlMessages("page.invoicing.table.value");
  const textState = IntlMessages("page.invoicing.table.state");
  const textCash = IntlMessages("page.pointSales.import.state.cash");
  const textCredit = IntlMessages("page.pointSales.import.state.credit");

  const columns = useMemo(() => [
    { text: textDate, dataField: "date", headerStyle: { width: '14%' }, cell: ({ row }) => formatDate(row.original.date) },
    { text: textCustomer, dataField: "customerName", headerStyle: { width: '34%' } },
    { text: textOrder, dataField: "purchaseOrderNumber", headerStyle: { width: '18%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' },
    { text: textState, dataField: "importable", headerStyle: { width: '14%' }, cell: ({ row }) => (canImportRow(row.original) ? textCash : textCredit) },
    { text: textValue, dataField: "total", headerStyle: { width: '14%' }, style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.total) }
  ], [textDate, textCustomer, textOrder, textState, textValue, textCash, textCredit]);

  const onSelect = (row) => {
    if (!canImportRow(row)) {
      notification('warning', 'page.pointSales.import.msg.credit', 'alert.warning.title');
      return;
    }
    fnSelect(row);
  };

  const config = useMemo(() => ({
    url: IMPORT_LIST_PATH, columns, onSelect, extraParams: { sessionId }, pageSize: 50, closeOnSelect: false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [columns, sessionId]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalImportInvoice;
