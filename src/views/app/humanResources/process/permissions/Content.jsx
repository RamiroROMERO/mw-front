import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewPermission from './ModalViewPermission';
import DetailPermission from './DetailPermission';
import { usePermissions } from './usePermissions';

const Permissions = ({ setLoading, screenControl }) => {

  const {dataPermissions, setBulkForm, openModalPermission, setOpenModalPermission, setFilePath, propsToControlPanel, propsToDetailPermission, propsToMsgDelete} = usePermissions({setLoading, screenControl});

  const propsToModalViewPermission = {
    ModalContent: ModalViewPermission,
    title: "page.permission.modal.viewPermission.title",
    open: openModalPermission,
    setOpen: setOpenModalPermission,
    maxWidth: 'lg',
    data: {
      dataPermissions,
      setFilePath,
      setBulkForm
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <DetailPermission {...propsToDetailPermission} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewPermission} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Permissions