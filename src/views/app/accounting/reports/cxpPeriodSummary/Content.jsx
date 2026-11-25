import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import { useCxPPeriodSummary } from './useCxPPeriodSummary';

const CxPPeriodSummary = ({ setLoading }) => {
  const { table, totals, orphans, propsToHeader } = useCxPPeriodSummary({ setLoading });

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
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsReport {...totals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {orphans.count > 0 && (
        <Row>
          <Colxx xxs="12" className="mt-3">
            <div className="alert alert-warning mb-0">
              {IntlMessages('page.cxpPeriodSummary.orphans.notice')} {orphans.count} | {orphans.total}
            </div>
          </Colxx>
        </Row>
      )}
    </>
  );
}
export default CxPPeriodSummary;
