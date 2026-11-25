import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import HeaderReport from './HeaderReport';
import { useBudgetExecution } from './useBudgetExecution';
import { activeNotices, noticeItemText, percentText } from './budgetExecutionRules';

const BudgetExecution = ({ setLoading }) => {
  const { table, notices, propsToHeader, formatNumber, t } = useBudgetExecution({ setLoading });
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
                      <td style={r.isChild ? { paddingLeft: '2rem' } : undefined}>{r.name}</td>
                      <td className="text-end">{r.isChild ? '' : formatNumber(r.budgeted)}</td>
                      <td className="text-end">{r.isChild ? formatNumber(r.value) : formatNumber(r.real)}</td>
                      <td className="text-end">{r.isChild ? '' : formatNumber(r.diff)}</td>
                      <td className="text-end">{r.isChild ? '' : percentText(r.percExecuted, formatNumber)}</td>
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
                {t(`page.budgetExecution.notice.${n.key}`)} {n.items.map(noticeItemText).join('; ')}
              </div>
            ))}
          </Colxx>
        </Row>
      )}
    </>
  );
}
export default BudgetExecution;
