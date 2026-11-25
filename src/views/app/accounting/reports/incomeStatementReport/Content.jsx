import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useIncomeStatementReport } from './useIncomeStatementReport';
import { activeNotices } from './incomeStatementRules';

// Tabla plana (no ReactTable): un Estado de Resultado es un documento ESTRUCTURADO donde
// el orden de las filas (secciones/subtotales) importa — paginar o reordenar rompería su
// sentido, a diferencia de un listado tabular normal. Mismo criterio ya usado para los
// modales de detalle de partida (ModalPdaDetail/ModalViewEntry).
const IncomeStatementReport = ({ setLoading }) => {
  const { table, notices, propsToHeader, formatNumber, t } = useIncomeStatementReport({ setLoading });
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
                      <td style={r.isDetail ? { paddingLeft: '2rem' } : undefined}>{r.description}</td>
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
              <div key={n.key} className="alert alert-warning mb-2">
                {t(`page.incomeStatementReport.notice.${n.key}`)} {n.count} {n.key === 'nonResultAccounts' ? `(${n.lines} ${t('page.incomeStatementReport.notice.lines')})` : ''} | {t('page.incomeStatementReport.notice.debit')} {formatNumber(n.debit)} | {t('page.incomeStatementReport.notice.credit')} {formatNumber(n.credit)}
              </div>
            ))}
          </Colxx>
        </Row>
      )}
    </>
  );
};
export default IncomeStatementReport;
