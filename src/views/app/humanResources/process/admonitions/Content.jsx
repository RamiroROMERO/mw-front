import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewAdmonition from './ModalViewAdmonition'
import DetailAdmonition from './DetailAdmonition'
import { useAdmonitions } from './useAdmonitions'

const Admonitions = ({ setLoading, screenControl }) => {

  const {dataAdmonitions, listOffenses, openModalAdmonition, setBulkForm, setFilePath, setFilterFaults, setOpenModalAdmonition, setShowDocto1, setShowDocto2, setShowDocto3, setShowOffense, setShowReportM, propsToControlPanel, propsToDetailAdmonition, propsToMsgCancel, propsToMsgDismissal} = useAdmonitions({setLoading, screenControl});

  const propsToModalAdmonition = {
    ModalContent: ModalViewAdmonition,
    title: "page.admonitions.modal.viewAdmonition.title",
    open: openModalAdmonition,
    setOpen: setOpenModalAdmonition,
    maxWidth: 'lg',
    data: {
      dataAdmonitions,
      setBulkForm,
      setFilePath,
      setShowDocto1,
      setShowDocto2,
      setShowDocto3,
      setShowOffense,
      setShowReportM,
      listOffenses,
      setFilterFaults
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
              <DetailAdmonition {...propsToDetailAdmonition} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAdmonition} />
      <Confirmation {...propsToMsgCancel} />
      <Confirmation {...propsToMsgDismissal} />
    </>
  )
}

export default Admonitions