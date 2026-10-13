import { Alert, Badge, Button, Input, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { isSelectable, skipReasonLabelKey } from './checkRangeRules';

const errorText = (error) => (error ? (error.description || error.name || '') : '');

// Regenerar partidas de cheques por rango (SPEC v2-28): rango + banco -> vista previa -> elegir -> regenerar.
export const ModalCheckRange = ({ data, setOpen }) => {
  const {
    t, form, onFormChange, preview, items, selected, selectedIds, results, resultCounts, busy, progress, fnPreview,
    fnToggle, allReadySelected, fnToggleAll, canConfirm, fnConfirm, privileges, readyIds
  } = data;
  const summary = preview ? preview.summary : null;
  const resultByCheck = Object.fromEntries((results || []).map((r) => [r.checkId, r]));

  return (
    <>
      <ModalBody>
        <Alert color="warning" className="small">{t('page.entryBalancing.checkRange.warning')}</Alert>
        {!privileges.repair && <Alert color="info" className="small">{t('page.entryBalancing.notice.noRepair')}</Alert>}

        <Row>
          <Colxx xxs="6" md="3"><DateCalendar name="dateStart" value={form.dateStart} onChange={onFormChange} label="page.entryBalancing.checkRange.dateStart" /></Colxx>
          <Colxx xxs="6" md="3"><DateCalendar name="dateEnd" value={form.dateEnd} onChange={onFormChange} label="page.entryBalancing.checkRange.dateEnd" /></Colxx>
          <Colxx xxs="12" md="3">
            <InputField name="bankCode" value={form.bankCode} onChange={onFormChange} label="page.entryBalancing.checkRange.bank" maxLength={5} />
          </Colxx>
          <Colxx xxs="12" md="3" className="d-flex align-items-center">
            <Button color="primary" size="sm" disabled={busy} onClick={fnPreview}>
              <i className="bi bi-search" /> {IntlMessages('page.entryBalancing.checkRange.button.preview')}
            </Button>
          </Colxx>
        </Row>

        {preview && (
          <>
            <div className="small my-2">
              {t('page.entryBalancing.checkRange.summary', { total: preview.total, ready: summary.ready, skipped: summary.skipped })}
              {summary.skipped > 0 && (
                <span className="text-muted"> ({Object.entries(summary.byReason).map(([reason, count]) => `${t(skipReasonLabelKey(reason))}: ${count}`).join(' · ')})</span>
              )}
            </div>
            {preview.truncated && <Alert color="warning" className="small">{t('page.entryBalancing.checkRange.truncated')}</Alert>}
            {readyIds.length > selectedIds.length && selectedIds.length > 0 && (
              <div className="small text-muted mb-1">{t('page.entryBalancing.checkRange.partialSelection', { selected: selectedIds.length, ready: readyIds.length })}</div>
            )}

            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th style={{ width: 30 }}>
                    <Input type="checkbox" checked={allReadySelected} disabled={readyIds.length === 0 || Boolean(results)} onChange={fnToggleAll} />
                  </th>
                  <th>{t('page.entryBalancing.checkRange.table.check')}</th>
                  <th>{t('page.entryBalancing.table.date')}</th>
                  <th>{t('page.entryBalancing.checkRange.bank')}</th>
                  <th>{t('page.entryBalancing.checkRange.table.payee')}</th>
                  <th className="text-end">{t('page.entryBalancing.checkRange.table.value')}</th>
                  <th>{t('page.entryBalancing.table.entry')}</th>
                  <th>{t('page.entryBalancing.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={8} className="text-center text-muted">{t('page.entryBalancing.table.empty')}</td></tr>}
                {items.map((item) => {
                  const done = resultByCheck[item.checkId];
                  return (
                    <tr key={item.checkId} className={isSelectable(item) ? undefined : 'text-muted'}>
                      <td><Input type="checkbox" checked={Boolean(selected[item.checkId])} disabled={!isSelectable(item) || Boolean(results)} onChange={() => fnToggle(item.checkId)} /></td>
                      <td>{item.checkNumber}</td>
                      <td>{DateHelper.format(item.date)}</td>
                      <td>{item.bankCode}</td>
                      <td>{item.providerName}</td>
                      <td className="text-end">{formatNumber(item.value)}</td>
                      <td>{item.pdaNumber || '-'}</td>
                      <td>
                        {done ? (
                          <>
                            <Badge color={done.status === 'repaired' ? 'success' : (done.status === 'error' ? 'danger' : 'secondary')}>
                              {t(`page.entryBalancing.checkRange.result.${done.status}`)}
                            </Badge>
                            {done.status === 'skipped' && <div className="small">{t(skipReasonLabelKey(done.skipReason))}</div>}
                            {done.status === 'error' && <div className="small text-danger">{errorText(done.error)}</div>}
                          </>
                        ) : (
                          isSelectable(item)
                            ? <Badge color="info">{t('page.entryBalancing.checkRange.status.ready')}</Badge>
                            : <span className="small">{t(skipReasonLabelKey(item.skipReason))}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </>
        )}

        {resultCounts && (
          <Alert color={resultCounts.error > 0 ? 'warning' : 'success'} className="small">
            {t('page.entryBalancing.checkRange.resultSummary', resultCounts)}
          </Alert>
        )}
        {progress && <div className="small text-muted">{progress}</div>}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{IntlMessages('page.entryBalancing.button.cancel')}</Button>
        <Button color="danger" disabled={!canConfirm} onClick={fnConfirm}>
          <i className="bi bi-arrow-repeat" /> {t('page.entryBalancing.checkRange.button.regenerate', { count: selectedIds.length })}
        </Button>
      </ModalFooter>
    </>
  );
};
