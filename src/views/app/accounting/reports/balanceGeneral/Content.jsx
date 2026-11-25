import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useBalanceGeneral } from './useBalanceGeneral';
import { activeNotices, isBalanced } from './balanceGeneralRules';

// Tabla plana (no ReactTable): mismo criterio ya usado en incomeStatementReport — el orden
// jerárquico de las filas (Tipo > Grupo > Cuenta hoja > Total) es semánticamente relevante.
const BalanceGeneral = ({ setLoading }) => {
  const { table, totals, notices, resultsSince, propsToHeader, formatNumber, t } = useBalanceGeneral({ setLoading });
  const shownNotices = activeNotices(notices);
  const cards = totals ? [
    ['activo', totals.activo], ['pasivo', totals.pasivo], ['capital', totals.capital], ['utility', totals.utility], ['difference', totals.difference]
  ] : [];

  const noticeText = (n) => {
    if (n.key === 'unbalancedEntries') return `${t('page.balanceGeneral.notice.unbalancedEntries')} ${t('page.balanceGeneral.notice.debit')} ${formatNumber(n.debit)} | ${t('page.balanceGeneral.notice.credit')} ${formatNumber(n.credit)} | ${t('page.balanceGeneral.notice.difference')} ${formatNumber(n.difference)}`;
    const types = n.key === 'otherTypes' && n.types?.length ? ` [${n.types.join(', ')}]` : '';
    return `${t(`page.balanceGeneral.notice.${n.key}`)} ${n.count}${types} (${n.lines} ${t('page.balanceGeneral.notice.lines')}) | ${t('page.balanceGeneral.notice.debit')} ${formatNumber(n.debit)} | ${t('page.balanceGeneral.notice.credit')} ${formatNumber(n.credit)}`;
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
          {cards.map(([key, value]) => (
            <Colxx xxs="6" md="2" key={key}>
              <Card className={`mb-3 ${key === 'difference' ? (isBalanced(totals) ? 'border-success' : 'border-danger') : ''}`}>
                <CardBody>
                  <p className="text-muted mb-1">{t(`page.balanceGeneral.summary.${key}`)}</p>
                  <h5>{formatNumber(value)}</h5>
                </CardBody>
              </Card>
            </Colxx>
          ))}
        </Row>
      )}
      {totals && (
        <Row>
          <Colxx xxs="12" className="mb-2 text-muted">
            {resultsSince ? `${t('page.balanceGeneral.resultsSince')} ${resultsSince}` : t('page.balanceGeneral.resultsSinceStart')}
          </Colxx>
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
                    <tr key={i} className={r.bold ? 'fw-bold' : ''}>
                      <td>{r.accountNumber || ''}</td>
                      <td style={r.kind === 'leaf' ? { paddingLeft: '2rem' } : undefined}>{r.accountName}</td>
                      <td className="text-end">{r.detailValue !== null ? formatNumber(r.detailValue) : ''}</td>
                      <td className="text-end">{r.groupValue !== null ? formatNumber(r.groupValue) : ''}</td>
                      <td className="text-end">{r.totalValue !== null ? formatNumber(r.totalValue) : ''}</td>
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
export default BalanceGeneral;
