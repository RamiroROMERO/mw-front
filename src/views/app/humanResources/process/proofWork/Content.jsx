import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewProofWork from './ModalViewProofWork'
import DetailProofWork from './DetailProofWork'
import { useProofWork } from './useProofWork'

const ProofWork = ({ setLoading, screenControl }) => {

  const {dataProofWork, openModalViewProofWork, setBulkForm, setFilePath, setOpenModalViewProofWork, propsToControlPanel, propsToDetailProofWork, propsToMsgDelete} = useProofWork({setLoading, screenControl});

  const propsToModalViewProofWork = {
    ModalContent: ModalViewProofWork,
    title: "page.proofWork.modal.viewProofWork.title",
    open: openModalViewProofWork,
    setOpen: setOpenModalViewProofWork,
    maxWidth: 'lg',
    data: {
      dataProofWork,
      setBulkForm,
      setFilePath
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
              <DetailProofWork {...propsToDetailProofWork} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProofWork} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ProofWork