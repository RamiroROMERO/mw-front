import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useBudgetExecution } from './useBudgetExecution';

const BudgetExecution = ({ setLoading }) => {
  const { table, propsToHeader, formatNumber } = useBudgetExecution({ setLoading });

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
                      <td style={r.isChild ? { paddingLeft: '2rem' } : undefined}>{r.name}</td>
                      <td className="text-end">{r.isChild ? '' : formatNumber(r.budgeted)}</td>
                      <td className="text-end">{r.isChild ? formatNumber(r.value) : formatNumber(r.real)}</td>
                      <td className="text-end">{r.isChild ? '' : formatNumber(r.diff)}</td>
                      <td className="text-end">{r.isChild ? '' : `${formatNumber(r.percExecuted)}%`}</td>
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
export default BudgetExecution;
