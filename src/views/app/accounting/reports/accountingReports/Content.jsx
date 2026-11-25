import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useAccountingReports } from './useAccountingReports';
import { activeNotices } from './accountingReportsRules';

// Tabla plana (no ReactTable), igual que el Estado de Resultado: un reporte por niveles es un documento ordenado con su fila de total, no un listado que se pagine o reordene.
const AccountingReports = ({ setLoading }) => {
  const { table, notices, propsToHeader, formatNumber, t } = useAccountingReports({ setLoading });
  const shownNotices = activeNotices(notices);

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
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      {table.columns.map((c) => (
                        <th key={c.dataField} className={c.number ? 'text-end' : ''}>{c.text}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((r) => (
                      <tr key={r.account}>
                        <td>{r.account}</td>
                        <td className={r.ungrouped ? 'fst-italic' : ''}>
                          {r.name}
                          {r.ungrouped && <span className="text-muted"> ({t('page.accountingReports.table.ungrouped')})</span>}
                        </td>
                        {table.mode === 'monthly' && r.months.map((v, i) => <td key={i} className="text-end">{formatNumber(v)}</td>)}
                        <td className="text-end fw-bold">{formatNumber(r.total)}</td>
                      </tr>
                    ))}
                    {table.rows.length > 0 && (
                      <tr className="fw-bold">
                        <td colSpan={2}>{t('page.accountingReports.table.totalRow')}</td>
                        {table.mode === 'monthly' && table.totals.months.map((v, i) => <td key={i} className="text-end">{formatNumber(v)}</td>)}
                        <td className="text-end">{formatNumber(table.totals.total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {shownNotices.length > 0 && (
        <Row>
          <Colxx xxs="12" className="mt-3">
            {shownNotices.map((n) => (
              <div key={n.key} className="alert alert-warning mb-2">
                {t(`page.accountingReports.notice.${n.key}`)} {n.count} | {t('page.accountingReports.notice.debit')} {formatNumber(n.debit)} | {t('page.accountingReports.notice.credit')} {formatNumber(n.credit)}
              </div>
            ))}
          </Colxx>
        </Row>
      )}
    </>
  );
};
export default AccountingReports;
