import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import { useCxCWeekly } from './useCxCWeekly';

const CxCWeekly = ({ setLoading }) => {
  const { table, totalsTable, propsToHeader, propsToModalDetail } = useCxCWeekly({ setLoading });

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
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <ReactTable {...totalsTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalDetail} />
    </>
  );
}
export default CxCWeekly;
