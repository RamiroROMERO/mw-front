import { useIntl } from 'react-intl';
import { Button, Input, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { formatNumber, formatDate } from '@Helpers/Utils';
import { AGING_BUCKETS, MAX_DOCUMENT_COMMENT, MAX_PROVIDER_COMMENT, canDeleteDocument, canEditComment, statusMessage } from './accountsToPayRules';

// Detalle de un proveedor (cont_cxpdeta.sc2): los documentos con saldo a la fecha de corte, con abono, notas de crédito y de débito, saldo, acumulado y estado, los tramos de antigüedad (respecto a la
// fecha de corte) y el panel de solo lectura de anticipos disponibles (distribuirlos es otra spec). Todo lo calcula el back (`GET accountsPayable/detailByProvider`). El comentario de la factura y el
// del proveedor se editan aquí; eliminar una cuenta por pagar sin pagos exige el privilegio de administrador.
// IntlMessages es un hook: un solo `useIntl` arriba y `t()` en el resto (nunca dentro de una condición).
const ModalDetail = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);
  const {
    detail, privileges, editing, editError, onEditText, fnStartEdit, fnCancelEdit, fnSaveEdit,
    providerComment, setProviderComment, providerCommentError, fnSaveProviderComment, fnAskDelete, fnPrint, fnExportXlsx
  } = data;

  if (!detail) return null;
  const { providerId, providerName, provider, rows, aging, totals, date, advances } = detail;
  const money = (value) => formatNumber(value);
  const canEdit = canEditComment(privileges);
  const hasActions = canEdit || rows.some((r) => canDeleteDocument(r, privileges));
  const isFree = (r) => Number(r.payments) === 0 && Number(r.creditNotes) === 0 && Number(r.debitNotes) === 0;

  const columns = [
    { text: t('page.accountsToPay.table.document'), dataField: 'documentCode', headerStyle: { width: '12%' } },
    { text: t('table.column.date'), dataField: 'date', headerStyle: { width: '8%' }, cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '') },
    { text: t('page.accountsToPay.table.dueDate'), dataField: 'dueDate', headerStyle: { width: '8%' }, cell: ({ row }) => (row.original.dueDate ? formatDate(row.original.dueDate) : '') },
    { text: t('page.accountsToPay.table.originalValue'), dataField: 'originalValue', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.originalValue) },
    { text: t('page.accountsToPay.table.payments'), dataField: 'payments', headerStyle: { width: '8%' }, cell: ({ row }) => money(row.original.payments) },
    { text: t('page.accountsToPay.table.creditNotes'), dataField: 'creditNotes', headerStyle: { width: '8%' }, cell: ({ row }) => money(row.original.creditNotes) },
    { text: t('page.accountsToPay.table.debitNotes'), dataField: 'debitNotes', headerStyle: { width: '8%' }, cell: ({ row }) => money(row.original.debitNotes) },
    { text: t('page.accountsToPay.table.balance'), dataField: 'balance', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.balance) },
    { text: t('page.accountsToPay.table.accumulated'), dataField: 'accumulated', headerStyle: { width: '9%' }, cell: ({ row }) => money(row.original.accumulated) },
    { text: t('page.accountsToPay.table.status'), dataField: 'status', headerStyle: { width: '11%' }, cell: ({ row }) => { const m = statusMessage(row.original.status); return t(m.id, m.values); } },
    {
      text: t('page.accountsToPay.table.comment'),
      dataField: 'description',
      headerStyle: { width: '14%' },
      cell: ({ row }) => {
        if (editing.id === row.original.id) {
          return (
            <div>
              <Input type="textarea" rows="2" maxLength={MAX_DOCUMENT_COMMENT} value={editing.text} onChange={onEditText} invalid={Boolean(editError)} data-testid="doc-comment" />
              <Button size="xs" color="primary" className="me-1 mt-1" onClick={fnSaveEdit}><i className="bi bi-save-fill" /></Button>
              <Button size="xs" color="secondary" className="mt-1" onClick={fnCancelEdit}><i className="bi bi-x-lg" /></Button>
            </div>
          );
        }
        return row.original.description || '';
      }
    }
  ];
  if (hasActions) {
    columns.push({
      text: '',
      dataField: 'actions',
      headerStyle: { width: '6%' },
      cell: ({ row }) => (
        <>
          {canEdit && <i className="bi bi-pencil-fill cursor-pointer me-2" title={t('page.accountsToPay.table.editComment')} onClick={() => fnStartEdit(row.original)} />}
          {canDeleteDocument(row.original, privileges) && isFree(row.original) && (
            <i className="bi bi-trash-fill cursor-pointer" title={t('button.delete')} onClick={() => fnAskDelete(row.original)} />
          )}
        </>
      )
    });
  }
  const table = { columns, data: rows, options: { pageSize: 10, pageSizeOptions: [10, 20, 50] } };

  const advancesTable = {
    columns: [
      { text: t('page.accountsToPay.detail.advances.date'), dataField: 'date', headerStyle: { width: '20%' }, cell: ({ row }) => (row.original.date ? formatDate(row.original.date) : '') },
      { text: t('page.accountsToPay.detail.advances.description'), dataField: 'description', headerStyle: { width: '40%' } },
      { text: t('page.accountsToPay.detail.advances.originalValue'), dataField: 'originalValue', headerStyle: { width: '20%' }, cell: ({ row }) => money(row.original.originalValue) },
      { text: t('page.accountsToPay.detail.advances.balance'), dataField: 'balance', headerStyle: { width: '20%' }, cell: ({ row }) => money(row.original.balance) }
    ],
    data: advances || [],
    options: { pageSize: 5 }
  };

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="6" sm="2"><strong>{t('table.column.code')}:</strong> {providerId}</Colxx>
          <Colxx xxs="12" sm="5"><strong>{t('page.accountsToPay.table.provider')}:</strong> {providerName}</Colxx>
          <Colxx xxs="6" sm="2"><strong>{t('page.accountsToPay.table.rtn')}:</strong> {provider.rtn || ''}</Colxx>
          <Colxx xxs="6" sm="3"><strong>{t('page.accountsToPay.input.date')}:</strong> {formatDate(date)}</Colxx>
        </Row>
        <Row className="mb-3 text-muted">
          <Colxx xxs="6" md="3">{t('page.accountsToPay.contact.name')}: {provider.contactName || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsToPay.contact.phone')}: {provider.phone || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsToPay.contact.contactPhone')}: {provider.contactPhone || ''}</Colxx>
          <Colxx xxs="6" md="3">{t('page.accountsToPay.contact.email')}: {provider.email || ''}</Colxx>
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
            <strong>{t('page.accountsToPay.table.total')}:</strong><br />{money(totals.balance)}
          </Colxx>
        </Row>
        <Row className="mt-3">
          <Colxx xxs="12">
            <strong>{t('page.accountsToPay.providerComment.title')}</strong>
            <Input
              type="textarea"
              rows="2"
              maxLength={MAX_PROVIDER_COMMENT}
              value={providerComment}
              disabled={!canEdit}
              invalid={Boolean(providerCommentError)}
              onChange={(e) => setProviderComment(e.target.value)}
              data-testid="provider-comment"
            />
            {canEdit && (
              <Button size="sm" color="primary" className="mt-2" onClick={fnSaveProviderComment}>
                <i className="bi bi-save-fill" /> {t('button.save')}
              </Button>
            )}
          </Colxx>
        </Row>
        {advances && advances.length > 0 && (
          <Row className="mt-3">
            <Colxx xxs="12">
              <h6>{t('page.accountsToPay.detail.advances.title')}</h6>
              <ReactTable {...advancesTable} />
            </Colxx>
          </Row>
        )}
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
