import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewAccidents from './ModalViewAccidents'
import DetailAccident from './DetailAccident'
import { useAccidents } from './useAccidents'

const Accidents = ({ setLoading, screenControl }) => {

  const {dataAccidents, openModalAccidents, setBulkForm, setFilePath, setOpenModalAccidents, setShowInputs, propsToControlPanel, propsToDetailAccident, propsToMsgDelete} = useAccidents({setLoading, screenControl});

  const propsToModalAccidents = {
    ModalContent: ModalViewAccidents,
    title: "page.accidents.modal.viewAccidents.title",
    open: openModalAccidents,
    setOpen: setOpenModalAccidents,
    maxWidth: 'lg',
    data: {
      dataAccidents,
      setFilePath,
      setBulkForm,
      setShowInputs
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
              <DetailAccident {...propsToDetailAccident} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAccidents} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Accidents