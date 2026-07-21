import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import { useHospitalizations } from './useHospitalizations';
import ModalDetail from '../events/ModalDetail';
import ModalChangeRoom from './ModalChangeRoom';

const Content = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, table, openModalDetail, setOpenModalDetail, dataModalDetail,
    openModalRoom, setOpenModalRoom, dataModalRoom, propsToMsgDischarge
  } = useHospitalizations({ setLoading });

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: "page.events.modalDetail.title",
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: dataModalDetail
  }

  const propsToModalRoom = {
    ModalContent: ModalChangeRoom,
    title: "page.hospitalizations.modalChangeRoom.title",
    open: openModalRoom,
    setOpen: setOpenModalRoom,
    maxWidth: 'lg',
    data: dataModalRoom
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-2" />
              <ReactTable {...table} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalDetail} />
      <Modal {...propsToModalRoom} />
      <Confirmation {...propsToMsgDischarge} />
    </>
  );
}
export default Content;