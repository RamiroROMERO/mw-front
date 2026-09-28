import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useTransferAffiliates } from './useTransferAffiliates';
import { UseTransferAffiliatesForm } from './UseTransferAffiliatesForm';
import { ModalViewTransferAffiliate } from './ModalViewTransferAffiliate';

const TrasferBetweenAffiliates = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocIn, listBanks, listAffiliates,
    formValidationIndex, sendForm, openModalView, setOpenModalView, dataList, fnViewTransfer,
    propsToMsgDelete
  } = useTransferAffiliates({ setLoading });

  const propsToForm = {
    formStateIndex, onInputChangeIndex, listDocIn, listBanks, listAffiliates, formValidationIndex, sendForm
  }

  const propsToModalView = {
    ModalContent: ModalViewTransferAffiliate,
    title: "page.transferAffiliates.modal.title.view",
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewTransfer }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <UseTransferAffiliatesForm {...propsToForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalView} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default TrasferBetweenAffiliates;
