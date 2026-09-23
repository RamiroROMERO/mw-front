import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import HeaderReport from './HeaderReport';
import { useAccountsReceivable } from './useAccountsReceivable';

const AccountsReceivable = ({ setLoading }) => {
  const { table, propsToHeader, propsToModalDetail } = useAccountsReceivable({ setLoading });

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
      <Modal {...propsToModalDetail} />
    </>
  );
}
export default AccountsReceivable;
