import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import HeaderReport from './HeaderReport';
import { useAccountsToPay } from './useAccountsToPay';

const AccountsToPay = ({ setLoading }) => {
  const { table, propsToHeader, propsToModalDetail, propsToModalReports, propsToMsgDelete } = useAccountsToPay({ setLoading });

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
      <Modal {...propsToModalReports} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
};
export default AccountsToPay;
