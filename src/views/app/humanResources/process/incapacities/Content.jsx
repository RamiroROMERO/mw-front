import { Card, CardBody, Row } from 'reactstrap'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewIncapacity from './ModalViewIncapacity'
import DetailIncapacity from './DetailIncapacity'
import { useIncapacities } from './useIncapacities'

const Incapacities = ({ setLoading, screenControl }) => {

  const {dataIncapacities, setBulkForm, openModalIncapacity, setOpenModalIncapacity, propsToControlPanel, propsToDetailIncapacity, propsToMsgDelete} = useIncapacities({setLoading, screenControl});

  const propsToModalIncapacity = {
    ModalContent: ModalViewIncapacity,
    title: "page.incapacities.modal.viewIncapacity.title",
    open: openModalIncapacity,
    setOpen: setOpenModalIncapacity,
    maxWidth: 'lg',
    data: {
      dataIncapacities,
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
              <Separator className="mt-2 mb-4" />
              <DetailIncapacity {...propsToDetailIncapacity} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalIncapacity} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Incapacities