import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useVariousDeposits } from './useVariousDeposits';
import { UseVariousDepositsForm } from './UseVariousDepositsForm';
import { ModalViewDeposit } from './ModalViewDeposit';
import { ModalSelectAdvance } from './ModalSelectAdvance';

const VariousDeposits = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount,
    listCustomer, formValidationIndex, sendForm, openModalViewDeposits, setOpenModalViewDeposits,
    dataDeposits, fnViewDeposit, openModalAdvance, setOpenModalAdvance, pendingAdvances,
    fnSelectAdvance, fnApplyAdvance, fnRemoveAdvance, propsToMsgDelete
  } = useVariousDeposits({ setLoading });

  const propsToDepositsForm = {
    formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount, listCustomer,
    formValidationIndex, sendForm, fnSelectAdvance, fnRemoveAdvance
  }

  const propsToModalViewDeposits = {
    ModalContent: ModalViewDeposit,
    title: "page.variousDeposits.modal.title.viewDeposits",
    open: openModalViewDeposits,
    setOpen: setOpenModalViewDeposits,
    maxWidth: 'lg',
    data: { dataDeposits, fnViewDeposit }
  }

  const propsToModalAdvance = {
    ModalContent: ModalSelectAdvance,
    title: "page.variousDeposits.modal.title.advance",
    open: openModalAdvance,
    setOpen: setOpenModalAdvance,
    maxWidth: 'lg',
    data: { pendingAdvances, fnApplyAdvance }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <UseVariousDepositsForm {...propsToDepositsForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewDeposits} />
      <Modal {...propsToModalAdvance} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default VariousDeposits;
