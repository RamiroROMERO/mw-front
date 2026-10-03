import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import { useCustomerDeposits } from './useCustomerDeposits';
import { UseCustomerDepositsForm } from './UseCustomerDepositsForm';
import { DepositLinesTable } from './DepositLinesTable';
import { ModalSelectInvoices } from './ModalSelectInvoices';
import { ModalViewCustomerDeposit } from './ModalViewCustomerDeposit';

const CustomerDeposits = (props) => {
  const { setLoading } = props;

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listDocto, listBanks, listAccount,
    listCustomer, formValidationIndex, sendForm, lines, fnUpdateLine, fnRemoveLine,
    fnOpenInvoicesPicker, openModalInvoices, setOpenModalInvoices, pendingInvoices, fnApplyInvoice,
    openModalView, setOpenModalView, dataList, fnViewDeposit, propsToMsgDelete, isApplied, totals, problem
  } = useCustomerDeposits({ setLoading });

  const propsToDepositForm = {
    formStateIndex, onInputChangeIndex, listDocto, listBanks, listCustomer, listAccount, formValidationIndex, sendForm, isApplied, problem
  }

  const propsToLinesTable = {
    lines, listAccount, fnUpdateLine, fnRemoveLine, fnOpenInvoicesPicker, isApplied, totals, problem
  }

  const propsToModalInvoices = {
    ModalContent: ModalSelectInvoices,
    title: "page.customerDeposits.modal.title.pendingInvoices",
    open: openModalInvoices,
    setOpen: setOpenModalInvoices,
    maxWidth: 'lg',
    data: { pendingInvoices, fnApplyInvoice }
  }

  const propsToModalView = {
    ModalContent: ModalViewCustomerDeposit,
    title: "page.customerDeposits.modal.title.view",
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'lg',
    data: { dataList, fnViewDeposit }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <UseCustomerDepositsForm {...propsToDepositForm} />
              <DepositLinesTable {...propsToLinesTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalInvoices} />
      <Modal {...propsToModalView} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CustomerDeposits;
