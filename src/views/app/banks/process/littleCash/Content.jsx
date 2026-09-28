import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useLittleCash } from './useLittleCash';
import { LittleCashForm } from './LittleCashForm';
import { ModalViewLittleCash } from './ModalViewLittleCash';
import { ModalLittleCashSettlement } from './ModalLittleCashSettlement';

const LittleCash = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocto, listAccount, listFunds,
    formValidationIndex, sendForm, openModalView, setOpenModalView, dataList, fnViewLittleCash,
    propsToMsgDelete, openModalSettlement, setOpenModalSettlement, idCch
  } = useLittleCash({ setLoading });

  const propsToForm = {
    formStateIndex, onInputChangeIndex, listDocto, listAccount, listFunds, formValidationIndex, sendForm
  }

  const propsToModalView = {
    ModalContent: ModalViewLittleCash,
    title: "page.littleCash.modal.title.view",
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewLittleCash }
  }

  const propsToModalSettlement = {
    ModalContent: ModalLittleCashSettlement,
    title: "page.littleCash.button.settlement",
    open: openModalSettlement,
    setOpen: setOpenModalSettlement,
    maxWidth: 'lg',
    data: { idCch, setLoading }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <LittleCashForm {...propsToForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalView} />
      <Modal {...propsToModalSettlement} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default LittleCash;
