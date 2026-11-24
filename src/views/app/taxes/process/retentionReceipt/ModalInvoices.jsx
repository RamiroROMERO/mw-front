import { useMemo } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';

// Facturas que se pueden retener del proveedor (las ya retenidas y las sin saldo a crédito no se ofrecen; las filtra el back).
const ModalInvoices = ({ data, setOpen }) => {
  const { invoices, fnSelectInvoice } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textInvoice = IntlMessages('page.retentionReceipt.table.Documentcode');
  const textDate = IntlMessages('page.retentionReceipt.table.date');
  const textSubtotal = IntlMessages('page.retentionReceipt.table.subtotal');
  const textBalance = IntlMessages('page.retentionReceipt.table.balance');
  const textOptions = IntlMessages('table.column.options');
  const textTitle = IntlMessages('page.retentionReceipt.modal.billToPay.table.title');
  const textSelect = IntlMessages('button.view');

  const table = useMemo(() => ({
    title: textTitle,
    columns: [
      { text: textInvoice, dataField: 'invoiceNumber', headerStyle: { width: '30%' } },
      { text: textDate, dataField: 'dateText', headerStyle: { width: '20%' } },
      { text: textSubtotal, dataField: 'subtotalText', headerStyle: { width: '20%' }, style: { textAlign: 'right' } },
      { text: textBalance, dataField: 'balanceText', headerStyle: { width: '20%' }, style: { textAlign: 'right' } },
      { text: textOptions, dataField: 'options', headerStyle: { width: '10%' } }
    ],
    data: invoices.map((item) => ({ ...item, dateText: formatDate(item.date), subtotalText: formatNumber(item.subtotal, '', 2), balanceText: formatNumber(item.balance, '', 2) })),
    options: { columnActions: 'options' },
    actions: [{ color: 'primary', icon: 'check-circle', toolTip: textSelect, onClick: fnSelectInvoice }]
  }), [invoices, fnSelectInvoice, textInvoice, textDate, textSubtotal, textBalance, textOptions, textTitle, textSelect]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12"><ReactTable {...table} /></Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}><i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalInvoices;
