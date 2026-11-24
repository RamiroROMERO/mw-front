import { useIntl } from 'react-intl';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { formatNumber, formatDate } from '@Helpers/Utils';
import { AGING_BUCKETS, canDeleteRow, canEditRow, currencyLabel, statusMessage } from './accountsReceivableRules';

// Detalle de un cliente (cont_cxcdeta.sc2): los documentos con saldo a la fecha de corte, con abono, notas de crédito y de débito, saldo, acumulado y estado, los tramos de antigüedad (respecto
// a la fecha de corte) y la información para cobro. Todo lo calcula el back (`GET cxc/detailByCustomer`). La cartera manual (tipo 5) sin cobros se edita o elimina desde aquí; el back valida.
// IntlMessages es un hook: un solo `useIntl` arriba y `t()` en el resto (nunca dentro de una condición).
const ModalDetail = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);
  const { detail, privileges, editing, editForm, editErrors, onEditChange, fnStartEdit, fnCancelEdit, fnSaveEdit, fnAskDelete, fnPrint, fnExportXlsx } = data;

  if (!detail) return null;
  const { customerId, customerName, customer, rows, aging, totals, date, currency } = detail;
  const money = (value) => formatNumber(value);
  const hasActions = rows.some((r) => canEditRow(r, privileges) || canDeleteRow(r, privileges));

  const columns = [
    { text: t('page.accountsReceivable.table.document'), dataField: 'documentCode', headerStyle: { width: '12%' } },
    { text: t('table.column.date'), dataField: 'date', headerStyle: { width: '8%' }, cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '') },
    { text: t('page.accountsReceivable.table.dueDate'), dataField: 'dueDate', headerStyle: { width: '8%' }, cell: ({ row }) => (row.original.dueDate ? formatDate(row.original.dueDate) : '') },
    { text: t('page.accountsReceivable.table.originalValue'), dataField: 'originalValue', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.originalValue) },
    { text: t('page.accountsReceivable.table.payments'), dataField: 'payments', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.payments) },
    { text: t('page.accountsReceivable.table.creditNotes'), dataField: 'creditNotes', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.creditNotes) },
    { text: t('page.accountsReceivable.table.debitNotes'), dataField: 'debitNotes', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.debitNotes) },
    { text: t('page.accountsReceivable.table.balance'), dataField: 'balance', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.balance) },
    { text: t('page.accountsReceivable.table.accumulated'), dataField: 'accumulated', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.accumulated) },
    { text: t('page.accountsReceivable.table.status'), dataField: 'status', headerStyle: { width: '12%' }, cell: ({ row }) => { const m = statusMessage(row.original.status); return t(m.id, m.values); } }
  ];
  if (hasActions) {
    columns.push({
      text: '',
      dataField: 'actions',
      headerStyle: { width: '6%' },
      cell: ({ row }) => (
        <>
          {canEditRow(row.original, privileges) && (
            <i className="bi bi-pencil-fill cursor-pointer me-2" title={t('button.edit')} onClick={() => fnStartEdit(row.original)} />
          )}
          {canDeleteRow(row.original, privileges) && (
            <i className="bi bi-trash-fill cursor-pointer" title={t('button.delete')} onClick={() => fnAskDelete(row.original)} />
          )}
        </>
      )
    });
  }
  const table = { columns, data: rows, options: { pageSize: 10, pageSizeOptions: [10, 20, 50] } };

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="6" sm="2"><strong>{t('table.column.code')}:</strong> {customerId}</Colxx>
          <Colxx xxs="12" sm="5"><strong>{t('page.accountsReceivable.table.customer')}:</strong> {customerName}</Colxx>
          <Colxx xxs="6" sm="2"><strong>{t('page.accountsReceivable.table.rtn')}:</strong> {customer.rtn || ''}</Colxx>
          <Colxx xxs="6" sm="3"><strong>{t('page.accountsReceivable.input.date')}:</strong> {formatDate(date)} · {t(currencyLabel(currency))}</Colxx>
        </Row>
        <Row className="mb-3 text-muted">
          <Colxx xxs="12"><strong>{t('page.accountsReceivable.collection.title')}:</strong></Colxx>
          <Colxx xxs="12" md="6">{t('page.accountsReceivable.collection.address')}: {customer.address || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsReceivable.collection.seller')}: {customer.sellerName || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsReceivable.collection.phone')}: {customer.phone || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsReceivable.collection.contact')}: {customer.contactName || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsReceivable.collection.contactPhone')}: {customer.contactPhone || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsReceivable.collection.mobile')}: {customer.contactMobile || ''}</Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className="div-action-button-container mb-2">
            <Button color="secondary" onClick={fnPrint}>
              <i className="iconsminds-printer" /> {t('button.print')}
            </Button>
            <Button color="secondary" onClick={fnExportXlsx}>
              <i className="bi bi-file-earmark-excel" /> {t('button.exportXls')}
            </Button>
          </Colxx>
        </Row>
        {editing && (
          <Row className="mb-3 align-items-end" data-testid="manual-edit">
            <Colxx xxs="12" md="3">
              <DateCalendar name="date" label="page.accountsReceivable.input.date" value={editForm.date} onChange={onEditChange} feedbackText={editErrors.date} />
            </Colxx>
            <Colxx xxs="12" md="3">
              <DateCalendar name="dueDate" label="page.accountsReceivable.table.dueDate" value={editForm.dueDate} onChange={onEditChange} feedbackText={editErrors.dueDate} />
            </Colxx>
            <Colxx xxs="12" md="3">
              <InputField name="value" label="page.accountsReceivable.table.originalValue" value={editForm.value} onChange={onEditChange} type="text" feedbackText={editErrors.value} />
            </Colxx>
            <Colxx xxs="12" md="3" className="div-action-button-container">
              <Button color="primary" onClick={fnSaveEdit}><i className="bi bi-save-fill" /> {t('button.save')}</Button>
              <Button color="secondary" onClick={fnCancelEdit}>{t('button.cancel')}</Button>
            </Colxx>
          </Row>
        )}
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <Row className="mt-3">
          {AGING_BUCKETS.map((bucket) => (
            <Colxx xxs="6" sm="4" md="2" className="text-end mb-2" key={bucket.field}>
              <strong>{t(bucket.label)}:</strong><br />{money(aging[bucket.field])}
            </Colxx>
          ))}
          <Colxx xxs="12" sm="4" md="2" className="text-end mb-2">
            <strong>{t('page.accountsReceivable.table.total')}:</strong><br />{money(totals.balance)}
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false); }}>
          <i className="bi bi-box-arrow-right" /> {t('button.exit')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalDetail;
