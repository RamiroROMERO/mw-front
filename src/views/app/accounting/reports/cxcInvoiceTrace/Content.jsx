import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import { useCxCInvoiceTrace } from './useCxCInvoiceTrace';

const CxCInvoiceTrace = ({ setLoading }) => {
  const { table, propsToHeader, propsToModalTrace } = useCxCInvoiceTrace({ setLoading });

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
export default CxCInvoiceTrace;
