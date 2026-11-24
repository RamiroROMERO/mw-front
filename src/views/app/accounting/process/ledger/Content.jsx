import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import SingleAccountMeta from './SingleAccountMeta';
import { useLedger } from './useLedger';

const Ledger = ({ setLoading }) => {
  const { table, propsToHeaderReport, propsToTotals, propsToModalViewEntry } = useLedger({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {propsToTotals && (
        <Row>
          <Colxx xxs="12" className="mb-3">
            <Card>
              <CardBody>
                <SingleAccountMeta {...propsToTotals} />
              </CardBody>
            </Card>
          </Colxx>
        </Row>
      )}
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalViewEntry} />
    </>
  );
};
export default Ledger;
