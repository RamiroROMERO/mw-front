import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import { useBalanceGeneral } from './useBalanceGeneral';

// Tabla plana (no ReactTable): mismo criterio ya usado en incomeStatementReport — el orden
// jerárquico de las filas (Tipo > Grupo > Cuenta hoja > Total) es semánticamente relevante.
const BalanceGeneral = ({ setLoading }) => {
  const { table, totals, propsToHeader, formatNumber } = useBalanceGeneral({ setLoading });

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
          <Colxx xxs="6" md="3">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.balanceGeneral.summary.activo')}</p>
                <h5>{formatNumber(totals.activo)}</h5>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="3">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.balanceGeneral.summary.pasivo')}</p>
                <h5>{formatNumber(totals.pasivo)}</h5>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="3">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.balanceGeneral.summary.capital')}</p>
                <h5>{formatNumber(totals.capital)}</h5>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="3">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.balanceGeneral.summary.pasivoPatrimonio')}</p>
                <h5>{formatNumber(totals.pasivoPatrimonio)}</h5>
              </CardBody>
            </Card>
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
                      <td style={!r.bold ? { paddingLeft: '2rem' } : undefined}>{r.accountName}</td>
                      <td className="text-end">{r.value !== null ? formatNumber(r.value) : ''}</td>
                      <td className="text-end">{r.total !== null ? formatNumber(r.total) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default BalanceGeneral;
