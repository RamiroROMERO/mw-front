import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import HeaderReport from './HeaderReport';
import { useCxCProjection } from './useCxCProjection';

const CxCProjection = ({ setLoading }) => {
  const { table, totalsTable, propsToHeader } = useCxCProjection({ setLoading });

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
        <Colxx xxs="12" md="6">
          <Card>
            <CardBody>
              <ReactTable {...totalsTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default CxCProjection;
