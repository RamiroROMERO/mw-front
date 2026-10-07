import { Alert, Badge, Button, ModalBody, ModalFooter, Table } from 'reactstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { categoryMeta, statusMeta, subcategoryLabelKey, actionLabelKey } from './entryBalancingRules';

export const ModalDetail = ({ data, setOpen }) => {
  const { item, data: detail } = data.detail;
  if (!item) return null;
  const cat = categoryMeta(item.category);
  const st = statusMeta(item.status);
  const lines = (detail && detail.lines) || [];
  const history = (detail && detail.history) || [];
  const header = detail && detail.header;

  return (
    <>
      <ModalBody>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <strong>{IntlMessages('page.entryBalancing.table.entry')} {item.nopda || '-'}</strong>
          <Badge color={cat.color}>{IntlMessages(cat.labelKey)}</Badge>
          {item.subcategory && <Badge color="light" className="text-dark">{IntlMessages(subcategoryLabelKey(item.subcategory))}</Badge>}
          <Badge color={st.color}>{IntlMessages(st.labelKey)}</Badge>
          {item.periodClosed && <Badge color="danger">{IntlMessages('page.entryBalancing.table.closed')}</Badge>}
        </div>

        <div className="mb-3 small">
          <div className="fw-bold">{IntlMessages('page.entryBalancing.detail.source')}</div>
          <div>
            {item.documentCode} {item.documentId} · {item.date} · {item.description}
            {item.source ? ` · ${typeof item.source === 'string' ? item.source : JSON.stringify(item.source)}` : ''}
          </div>
          <div>
            {IntlMessages('page.entryBalancing.table.debit')} {formatNumber(item.debit)} · {IntlMessages('page.entryBalancing.table.credit')} {formatNumber(item.credit)}
            {' '}· {IntlMessages('page.entryBalancing.table.difference')} {formatNumber(item.difference)}
            {' '}· {IntlMessages('page.entryBalancing.detail.headerValue')} {formatNumber(item.headerValue)}
          </div>
          {header && header.description ? <div>{header.description}</div> : null}
        </div>

        {item.nopda ? (
          <>
            <div className="fw-bold">{IntlMessages('page.entryBalancing.detail.lines')}</div>
            <Table bordered size="sm" responsive>
              <thead>
                <tr>
                  <th>{IntlMessages('page.entryBalancing.detail.line')}</th>
                  <th>{IntlMessages('page.entryBalancing.detail.account')}</th>
                  <th>{IntlMessages('page.entryBalancing.table.description')}</th>
                  <th className="text-end">{IntlMessages('page.entryBalancing.table.debit')}</th>
                  <th className="text-end">{IntlMessages('page.entryBalancing.table.credit')}</th>
                  <th>{IntlMessages('page.entryBalancing.detail.reconciled')}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id} className={l.isBlank ? 'table-danger' : undefined}>
                    <td>{l.numberLine}</td>
                    <td>{l.isBlank ? <em>{IntlMessages('page.entryBalancing.detail.blankAccount')}</em> : l.accountNumber}</td>
                    <td>{l.description}</td>
                    <td className="text-end">{formatNumber(l.debit)}</td>
                    <td className="text-end">{formatNumber(l.credit)}</td>
                    <td>{l.reconciled ? <i className="bi bi-check2" /> : ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="fw-bold">{IntlMessages('page.entryBalancing.detail.history')}</div>
            {history.length === 0 && <Alert color="light" className="py-1">{IntlMessages('page.entryBalancing.detail.noHistory')}</Alert>}
            {history.map((h) => (
              <div key={h.id} className="small border-bottom py-1">
                {String(h.createdAt || '').slice(0, 16).replace('T', ' ')} · {IntlMessages(actionLabelKey(h.action))} · {IntlMessages(statusMeta(h.status).labelKey)}
                {h.reason ? ` · ${IntlMessages('page.entryBalancing.detail.reason')}: ${h.reason}` : ''}
                {h.adjustmentNopda ? ` · ${IntlMessages('page.entryBalancing.detail.adjustment')}: ${h.adjustmentNopda}` : ''}
                {h.userId ? ` · ${IntlMessages('page.entryBalancing.detail.user')}: ${h.userId}` : ''}
              </div>
            ))}
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{IntlMessages('page.entryBalancing.button.close')}</Button>
      </ModalFooter>
    </>
  );
};
