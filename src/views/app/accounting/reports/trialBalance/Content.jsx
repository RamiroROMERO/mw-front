import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useTrialBalance } from './useTrialBalance';
import { activeNotices, isBalanced } from './trialBalanceRules';

const TrialBalance = ({ setLoading }) => {
  const { table, totals, notices, propsToHeader, formatNumber, t } = useTrialBalance({ setLoading });
  const shownNotices = activeNotices(notices);
  const cards = totals ? [
    ['debit', totals.debit, null], ['credit', totals.credit, null], ['difference', totals.difference, totals.difference],
    ['debtorBalance', totals.debtorBalance, null], ['creditorBalance', totals.creditorBalance, null], ['balanceDifference', totals.balanceDifference, totals.balanceDifference]
  ] : [];

  const noticeText = (n) => {
    const types = n.key === 'otherTypes' && n.types?.length ? ` [${n.types.join(', ')}]` : '';
    return `${t(`page.trialBalance.notice.${n.key}`)} ${n.count}${types} (${n.lines} ${t('page.trialBalance.notice.lines')}) | ${t('page.trialBalance.notice.debit')} ${formatNumber(n.debit)} | ${t('page.trialBalance.notice.credit')} ${formatNumber(n.credit)}`;
  };

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeader} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {totals && (
        <Row>
          {cards.map(([key, value, control]) => (
            <Colxx xxs="6" md="2" key={key}>
              <Card className={`mb-3 ${control === null ? '' : (isBalanced(control) ? 'border-success' : 'border-danger')}`}>
                <CardBody>
                  <p className="text-muted mb-1">{t(`page.trialBalance.summary.${key}`)}</p>
                  <h6>{formatNumber(value)}</h6>
                </CardBody>
              </Card>
            </Colxx>
          ))}
        </Row>
      )}
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    {table.columns.map((c) => (
                      <th key={c.dataField} style={c.headerStyle}>{c.text}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, i) => (
                    <tr key={`${r.accountNumber}-${i}`} className={r.recognized ? '' : 'text-muted fst-italic'}>
                      <td>{r.accountNumber}</td>
                      <td>{r.accountName}</td>
                      <td className="text-end">{formatNumber(r.accumulated)}</td>
                      <td className="text-end">{formatNumber(r.debit)}</td>
                      <td className="text-end">{formatNumber(r.credit)}</td>
                      <td className="text-end">{formatNumber(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {shownNotices.length > 0 && (
        <Row>
          <Colxx xxs="12" className="mt-3">
            {shownNotices.map((n) => (
              <div key={n.key} className="alert alert-warning mb-2">{noticeText(n)}</div>
            ))}
          </Colxx>
        </Row>
      )}
    </>
  );
}
export default TrialBalance;
