import { Alert, Badge, Button, Input, Label, ModalBody, ModalFooter, Table } from 'reactstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import {
  actionLabelKey, requirementsOf, resultMeta, countByResult, categoryMeta
} from './entryBalancingRules';

const errorText = (error) => (error ? (error.description || error.name || '') : '');

const LinesTable = ({ rows, title }) => (
  <>
    <div className="small fw-bold mt-2">{title}</div>
    <Table bordered size="sm" className="mb-2">
      <thead>
        <tr>
          <th>#</th>
          <th>{IntlMessages('page.entryBalancing.detail.account')}</th>
          <th className="text-end">{IntlMessages('page.entryBalancing.table.debit')}</th>
          <th className="text-end">{IntlMessages('page.entryBalancing.table.credit')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={`${r.numberLine || idx}-${r.accountNumber}`}>
            <td>{r.numberLine || idx + 1}</td>
            <td>{r.accountNumber}</td>
            <td className="text-end">{formatNumber(r.valueDebit)}</td>
            <td className="text-end">{formatNumber(r.valueCredit)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </>
);

const Plan = ({ plan }) => {
  if (!plan) return null;
  const header = plan.headerUpdate && Object.keys(plan.headerUpdate).length ? plan.headerUpdate : null;
  const updates = plan.lineUpdates || [];
  const inserts = plan.lineInserts || [];
  const entry = plan.newEntry || null;
  return (
    <div className="ps-2">
      {header && (
        <div className="small">
          <span className="fw-bold">{IntlMessages('page.entryBalancing.preview.header')}: </span>
          {Object.entries(header).map(([k, v]) => `${k} = ${typeof v === 'number' ? formatNumber(v) : v}`).join(' · ')}
        </div>
      )}
      {updates.length > 0 && (
        <div className="small">
          <span className="fw-bold">{IntlMessages('page.entryBalancing.preview.lineUpdates')}: </span>
          {updates.map((u) => JSON.stringify(u)).join(' | ')}
        </div>
      )}
      {inserts.length > 0 && <LinesTable rows={inserts} title={IntlMessages('page.entryBalancing.preview.lineInserts')} />}
      {entry && (
        <div>
          <div className="small">
            <span className="fw-bold">{IntlMessages('page.entryBalancing.preview.newEntry')}: </span>
            {entry.date} · {entry.description} · {formatNumber(entry.value)}
          </div>
          <LinesTable rows={entry.lines || []} title={IntlMessages('page.entryBalancing.detail.lines')} />
        </div>
      )}
    </div>
  );
};

const ResultsList = ({ results, items }) => (
  <>
    {results.map((r) => {
      const item = r.item || items.find((it) => it.key === r.key) || {};
      const meta = resultMeta(r.status);
      const cat = categoryMeta(item.category);
      return (
        <div key={r.key} className="border rounded p-2 mb-2">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <strong>{item.nopda ? `${IntlMessages('page.entryBalancing.table.entry')} ${item.nopda}` : r.key}</strong>
            <span>{item.documentCode} {item.documentId}</span>
            {item.category && <Badge color={cat.color}>{IntlMessages(cat.labelKey)}</Badge>}
            <Badge color={meta.color}>{IntlMessages(meta.labelKey)}</Badge>
            {(r.periodClosed || item.periodClosed) && (
              <Badge color="danger">{IntlMessages('page.entryBalancing.preview.closedItem')}</Badge>
            )}
            {r.adjustmentNopda ? <span className="small">{IntlMessages('page.entryBalancing.detail.adjustment')}: {r.adjustmentNopda}</span> : null}
          </div>
          {r.periodNote && <div className="small text-danger">{errorText(r.periodNote)}</div>}
          {r.reason && <div className="small text-muted">{r.reason}</div>}
          {r.error && <div className="small text-danger">{errorText(r.error)}</div>}
          <Plan plan={r.plan} />
        </div>
      );
    })}
  </>
);

export const ModalPreview = ({ data, setOpen }) => {
  const {
    work, listAccount, onFormChange, onAssignmentChange, fnPreview, previewResults, repairResults, confirmClosed,
    setConfirmClosed, busy, progress, closedInPreview, closedAllowed, canConfirm, fnConfirmRepair, privileges
  } = data;
  const req = requirementsOf(work.action);
  const shown = repairResults || previewResults;
  const counts = countByResult(shown || []);

  return (
    <>
      <ModalBody>
        <div className="mb-2">
          <strong>{IntlMessages(actionLabelKey(work.action))}</strong> · {work.items.length}
        </div>
        {!privileges.repair && <Alert color="warning">{IntlMessages('page.entryBalancing.bar.noPermission')}</Alert>}

        {(req.account || req.date) && (
          <div className="row">
            {req.account && (
              <div className="col-12 col-md-8">
                <SearchSelect
                  name="accountNumber"
                  inputValue={work.form.accountNumber}
                  onChange={onFormChange}
                  label={req.account === 'optional' ? 'page.entryBalancing.preview.accountOptional' : 'page.entryBalancing.preview.account'}
                  options={listAccount}
                />
              </div>
            )}
            {req.date && (
              <div className="col-12 col-md-4">
                <DateCalendar name="date" value={work.form.date} onChange={onFormChange} label="page.entryBalancing.preview.date" />
              </div>
            )}
          </div>
        )}

        {req.assignments && (
          <div className="mb-3">
            <div className="fw-bold mb-1">{IntlMessages('page.entryBalancing.preview.assignments')}</div>
            {work.items.map((it) => (
              <div key={it.key} className="border rounded p-2 mb-2">
                <div className="small mb-1">{IntlMessages('page.entryBalancing.table.entry')} {it.nopda} · {it.documentCode} {it.documentId}</div>
                {(work.lines[it.key] || []).map((line) => (
                  <div key={line.id} className="row align-items-end">
                    <div className="col-12 col-md-5 small">
                      #{line.numberLine} · {line.description} · {formatNumber(line.debit)} / {formatNumber(line.credit)}
                    </div>
                    <div className="col-12 col-md-7">
                      <SearchSelect
                        name={`line-${line.id}`}
                        inputValue={work.form.assignments[line.id] || ''}
                        onChange={(e) => onAssignmentChange(line.id, e.target.value)}
                        label=""
                        options={listAccount}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="mb-3">
          <Button color="primary" size="sm" disabled={busy} onClick={fnPreview}>
            <i className="bi bi-eye" /> {IntlMessages('page.entryBalancing.preview.refresh')}
          </Button>
          {progress && <span className="ms-2 small text-muted">{progress}</span>}
        </div>

        {!shown && <Alert color="light">{IntlMessages('page.entryBalancing.preview.nothing')}</Alert>}
        {shown && (
          <>
            <div className="small mb-2">
              {repairResults
                ? <strong>{IntlMessages('page.entryBalancing.preview.resultTitle')}: </strong>
                : <strong>{IntlMessages('page.entryBalancing.preview.title')}: </strong>}
              {Object.entries(counts).map(([status, n]) => `${IntlMessages(resultMeta(status).labelKey)} ${n}`).join(' · ')}
            </div>
            <ResultsList results={shown} items={work.items} />
          </>
        )}

        {previewResults && !repairResults && closedInPreview && (
          closedAllowed ? (
            <Label check className="d-block mt-2">
              <Input type="checkbox" checked={confirmClosed} onChange={(e) => setConfirmClosed(e.target.checked)} />{' '}
              {IntlMessages('page.entryBalancing.preview.confirmClosed')}
            </Label>
          ) : (
            <Alert color="danger" className="mt-2">{IntlMessages('page.entryBalancing.preview.closedNoPrivilege')}</Alert>
          )
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{IntlMessages('page.entryBalancing.button.close')}</Button>
        {!repairResults && (
          <Button color="success" disabled={!canConfirm} onClick={fnConfirmRepair}>
            <i className="bi bi-check2-circle" /> {IntlMessages('page.entryBalancing.button.confirm')}
          </Button>
        )}
      </ModalFooter>
    </>
  );
};
