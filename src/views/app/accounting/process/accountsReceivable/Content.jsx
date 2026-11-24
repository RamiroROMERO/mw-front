import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import HeaderReport from './HeaderReport';
import { useAccountsReceivable } from './useAccountsReceivable';

const AccountsReceivable = ({ setLoading }) => {
  const { table, propsToHeader, propsToModalDetail, propsToMsgDelete } = useAccountsReceivable({ setLoading });

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
      <Confirmation {...propsToMsgDelete} />
    </>
  );
};
export default AccountsReceivable;
