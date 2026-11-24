import { useMemo } from 'react';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import { ModalSearchContent } from '@Components/modalSearch';
import { RECEIPT_URL } from './retentionReceiptRules';

// Buscar comprobante: páginas de 50 con búsqueda en el servidor (proveedor, RTN, número fiscal o id). Un anulado se lista marcado.
const mapRow = (item) => ({
  ...item,
  dateText: formatDate(item.date),
  totalText: formatNumber(item.total, '', 2),
  stateText: item.status ? (Number(item.pdaNumber) > 0 ? '●' : '') : '✖'
});

const ModalSearchRetention = ({ data, setOpen }) => {
  const { fnLoadDocument } = data;

  const textDate = IntlMessages('page.retentionReceipt.table.date');
  const textNumber = IntlMessages('page.retentionReceipt.table.documentCode');
  const textProvider = IntlMessages('page.retentionReceipt.table.providerId');
  const textTotal = IntlMessages('page.retentionReceipt.table.total');

  const columns = useMemo(() => [
    { text: textDate, dataField: 'dateText', headerStyle: { width: '15%' } },
    { text: textNumber, dataField: 'numberCAI', headerStyle: { width: '25%' } },
    { text: textProvider, dataField: 'providerName', headerStyle: { width: '40%' } },
    { text: textTotal, dataField: 'totalText', headerStyle: { width: '15%' }, style: { textAlign: 'right' } },
    { text: '', dataField: 'stateText', headerStyle: { width: '5%' } }
  ], [textDate, textNumber, textProvider, textTotal]);

  const config = useMemo(() => ({ url: RECEIPT_URL, columns, onSelect: fnLoadDocument, mapRow }), [columns, fnLoadDocument]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSearchRetention;
