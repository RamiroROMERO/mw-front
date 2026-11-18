import { useMemo } from "react";
import { formatNumber, IntlMessages } from "@Helpers/Utils";
import DateHelper from "@Helpers/DateHelper";
import { ModalSearchContent } from "@Components/modalSearch";

// Buscar orden de compra (revisión de pantalla #7, SPEC v2-67-sr): las órdenes se piden por páginas de 50 con búsqueda en el servidor (número, cliente, RTN o teléfono),
// como Cotizaciones, Clientes y el Catálogo de productos; antes se bajaban todas y se filtraban en el navegador. Lo usan también Facturación (cargar una orden).
const ORDERS_URL = 'billing/process/purchaseOrders';

const ModalSeekPurchaseOrders = (props) => {
  const { data, setOpen } = props;
  const { fnViewItem, dateFormat } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textNumber = IntlMessages("input.number");
  const textDate = IntlMessages("input.date");
  const textName = IntlMessages("input.name");
  const textTotal = IntlMessages("input.total");

  const columns = useMemo(() => [
    {
      text: textNumber, dataField: "id", headerStyle: { 'width': '15%' },
      classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
    },
    {
      text: textDate, dataField: "date", headerStyle: { 'width': '15%' },
      classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell',
      cell: ({ row }) => DateHelper.formatCompany(row.original.date, dateFormat)
    },
    { text: textName, dataField: "customerName", headerStyle: { 'width': '40%' } },
    {
      text: textTotal, dataField: "total", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell', cell: ({ row }) => formatNumber(row.original.total, "L. ", 2)
    }
  ], [textNumber, textDate, textName, textTotal, dateFormat]);

  const config = useMemo(() => ({
    url: ORDERS_URL, columns, onSelect: fnViewItem
  }), [columns, fnViewItem]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSeekPurchaseOrders;
