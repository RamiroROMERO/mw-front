import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import { useCxPInvoiceTrace } from './useCxPInvoiceTrace';

const CxPInvoiceTrace = ({ setLoading }) => {
  const { table, propsToHeader, propsToModalTrace } = useCxPInvoiceTrace({ setLoading });

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
      <Modal {...propsToModalTrace} />
    </>
  );
}
export default CxPInvoiceTrace;
