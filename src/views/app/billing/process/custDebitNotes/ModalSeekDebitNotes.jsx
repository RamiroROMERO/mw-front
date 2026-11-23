import { useMemo } from 'react';
import { formatDate, formatNumber, IntlMessages } from '@Helpers/Utils';
import { ModalSearchContent } from '@Components/modalSearch';

// Buscar nota de débito (SPEC v2-92-sr): páginas de 50 con búsqueda en el servidor (número, CAI, cliente o RTN), como Cotizaciones y Clientes.
// La búsqueda incremental, la paginación y la acción de selección son el modal compartido `@Components/modalSearch`; aquí solo se configura.
const DEBIT_NOTES_URL = 'billing/process/debitNotes';

const ModalSeekDebitNotes = ({ data, setOpen }) => {
  const { fnView } = data;
  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo ni de una condición.
  const textDate = IntlMessages('page.invoicing.table.date');
  const textNumber = IntlMessages('page.invoicing.table.number');
  const textInvoice = IntlMessages('page.invoicing.table.invoice');
  const textCustomer = IntlMessages('page.invoicing.table.customer');
  const textType = IntlMessages('page.custDebitNotes.title.type');
  const textValue = IntlMessages('page.invoicing.table.value');
  const typeTexts = [
    '', IntlMessages('page.custDebitNotes.radio.lateFee'), IntlMessages('page.custDebitNotes.radio.otherCharge'),
    IntlMessages('page.custDebitNotes.radio.adjustment'), IntlMessages('page.custDebitNotes.radio.other')
  ];
  const typeKey = typeTexts.join('|');

  const columns = useMemo(() => [
    { text: textDate, dataField: 'date', headerStyle: { width: '12%' }, cell: ({ row }) => formatDate(row.original.date) },
    { text: textNumber, dataField: 'documentId', headerStyle: { width: '10%' } },
    { text: textInvoice, dataField: 'numberCAI', headerStyle: { width: '20%' } },
    { text: textCustomer, dataField: 'clientName', headerStyle: { width: '28%' }, cell: ({ row }) => (row.original.clientData ? row.original.clientData.name : '') },
    { text: textType, dataField: 'typeId', headerStyle: { width: '12%' }, cell: ({ row }) => typeTexts[row.original.typeId] || '' },
    { text: textValue, dataField: 'valueLps', headerStyle: { width: '12%' }, style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.valueLps) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [textDate, textNumber, textInvoice, textCustomer, textType, textValue, typeKey]);

  const config = useMemo(() => ({ url: DEBIT_NOTES_URL, columns, onSelect: fnView }), [columns, fnView]);
  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSeekDebitNotes;
