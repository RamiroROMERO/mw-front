import { useMemo } from 'react';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import { ModalSearchContent } from '@Components/modalSearch';

// Buscar factura de costos y gastos: páginas de 50 con búsqueda en el servidor (N° de factura, proveedor o descripción).
// La tabla, la búsqueda incremental y la paginación son el modal compartido `@Components/modalSearch`; aquí solo se configura.
const OTHER_PURCHASES_URL = 'inventory/process/otherPurchases';

const mapRow = (item) => ({
  ...item,
  dateIn: formatDate(item.date),
  valueTotal: formatNumber(item.total, '', 2)
});

const ModalSearchOtherPurchases = ({ data, setOpen }) => {
  const { fnLoadDocument } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textDocumentId = IntlMessages('page.purchases.modal.viewPurchases.table.documentId');
  const textDate = IntlMessages('page.purchases.modal.viewPurchases.table.date');
  const textInvoice = IntlMessages('page.purchases.modal.viewPurchases.table.numCai');
  const textProvider = IntlMessages('page.purchases.modal.viewPurchases.table.provider');
  const textTotal = IntlMessages('page.purchases.modal.viewPurchases.table.total');

  const columns = useMemo(() => [
    { text: textDocumentId, dataField: 'documentId', headerStyle: { width: '10%' } },
    { text: textDate, dataField: 'dateIn', headerStyle: { width: '15%' } },
    { text: textInvoice, dataField: 'invoiceNumber', headerStyle: { width: '20%' } },
    { text: textProvider, dataField: 'providerName', headerStyle: { width: '40%' } },
    { text: textTotal, dataField: 'valueTotal', headerStyle: { width: '15%' }, style: { textAlign: 'right' } }
  ], [textDocumentId, textDate, textInvoice, textProvider, textTotal]);

  const config = useMemo(() => ({
    url: OTHER_PURCHASES_URL, columns, onSelect: fnLoadDocument, mapRow
  }), [columns, fnLoadDocument]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSearchOtherPurchases;
