import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useTransferAccounts } from './useTransferAccounts';
import { UseTransferAccountsForm } from './UseTransferAccountsForm';
import { ModalViewTransferAccount } from './ModalViewTransferAccount';

const TrasferBetweenAccounts = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocIn, listDocOut, listBanks,
    formValidationIndex, sendForm, openModalView, setOpenModalView, dataList, fnViewTransfer,
    propsToMsgDelete
  } = useTransferAccounts({ setLoading });

  const propsToTransferForm = {
    formStateIndex, onInputChangeIndex, listDocIn, listDocOut, listBanks, formValidationIndex, sendForm
  }

  const propsToModalView = {
    ModalContent: ModalViewTransferAccount,
    title: "page.transferAccounts.modal.title.view",
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
              <UseTransferAccountsForm {...propsToTransferForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalView} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default TrasferBetweenAccounts;
