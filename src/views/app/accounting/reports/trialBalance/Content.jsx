import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import { useTrialBalance } from './useTrialBalance';

const TrialBalance = ({ setLoading }) => {
  const { table, totals, propsToHeader, formatNumber } = useTrialBalance({ setLoading });

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
          <Colxx xxs="6" md="2">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.trialBalance.summary.accumulated')}</p>
                <h6>{formatNumber(totals.accumulated)}</h6>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="2">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.trialBalance.summary.debit')}</p>
                <h6>{formatNumber(totals.debit)}</h6>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="2">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.trialBalance.summary.credit')}</p>
                <h6>{formatNumber(totals.credit)}</h6>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="3">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.trialBalance.summary.balance')}</p>
                <h6>{formatNumber(totals.balance)}</h6>
              </CardBody>
            </Card>
          </Colxx>
          <Colxx xxs="6" md="3">
            <Card className="mb-3">
              <CardBody>
                <p className="text-muted mb-1">{IntlMessages('page.trialBalance.summary.difference')}</p>
                <h6>{formatNumber(totals.difference)}</h6>
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
                    <tr key={i}>
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
    </>
  );
}
export default TrialBalance;
