import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalViewVacations from './ModalViewVacations'
import DetailVacation from './DetailVacation'
import { useVacations } from './useVacations'

const Vacations = ({ setLoading, screenControl }) => {

  const {dataVacations, openModalVacations, setBulkForm, setFilePath, setOpenModalVacations, propsToControlPanel, propsToDetailVacation, propsToMsgDelete} = useVacations({setLoading, screenControl});

  const propsToModalViewVacations = {
    ModalContent: ModalViewVacations,
    title: "page.vacations.modal.viewVacation.title",
    open: openModalVacations,
    setOpen: setOpenModalVacations,
    maxWidth: 'lg',
    data: {
      dataVacations,
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
              <DetailVacation {...propsToDetailVacation} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewVacations} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Vacations