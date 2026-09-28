import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useCashWithdrawal } from './useCashWithdrawal';
import { UseCashWithdrawalForm } from './UseCashWithdrawalForm';
import { ModalViewCashWithdrawal } from './ModalViewCashWithdrawal';

const CashWithdrawal = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount,
    formValidationIndex, sendForm, openModalView, setOpenModalView, dataList, fnViewWithdrawal,
    propsToMsgDelete
  } = useCashWithdrawal({ setLoading });

  const propsToForm = {
    formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount, formValidationIndex, sendForm
  }

  const propsToModalView = {
    ModalContent: ModalViewCashWithdrawal,
    title: "page.cashWithdrawal.modal.title.view",
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewWithdrawal }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <UseCashWithdrawalForm {...propsToForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalView} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CashWithdrawal;
