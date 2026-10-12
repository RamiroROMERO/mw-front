import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import { useBanksBook } from './useBanksBook';
import { ModalEditRecord } from './ModalEditRecord';

const BanksBooks = ({ setLoading }) => {
  const {
    table, propsToHeaderReport, propsToTotals, openEdit, setOpenEdit, propsToEdit, propsToMsgDelete
  } = useBanksBook({ setLoading });
  const modalEdit = {
    ModalContent: ModalEditRecord, title: 'page.banksBook.edit.title', open: openEdit, setOpen: setOpenEdit, maxWidth: 'lg', data: propsToEdit
  };

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
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsReport {...propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...modalEdit} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default BanksBooks;
