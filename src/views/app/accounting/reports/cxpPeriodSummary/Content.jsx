import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import { useCxPPeriodSummary } from './useCxPPeriodSummary';

const CxPPeriodSummary = ({ setLoading }) => {
  const { table, totals, propsToHeader } = useCxPPeriodSummary({ setLoading });

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
    </>
  );
}
export default CxPPeriodSummary;
