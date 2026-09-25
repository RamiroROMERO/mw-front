import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import HeaderReport from './HeaderReport';
import { useAccountingClosures } from './useAccountingClosures';

const AccountingClosures = ({ setLoading }) => {
  const {
    table, propsToHeader, propsToModalSettings, propsToModalIncomeStatement, propsToModalViewEntry,
    propsToConfirmExecute, propsToConfirmDelete
  } = useAccountingClosures({ setLoading });

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
        <Colxx xxs="12" md="8">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalSettings} />
      <Modal {...propsToModalIncomeStatement} />
      <Modal {...propsToModalViewEntry} />
      <Confirmation {...propsToConfirmExecute} />
      <Confirmation {...propsToConfirmDelete} />
    </>
  );
}
export default AccountingClosures;
