import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@Components/controlPanel';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useTransfers } from './useTransfers';
import { UseTransfersForm } from './UseTransfersForm';
import { useTransfersDetail } from './useTransfersDetail';
import { UseDetailForm } from './UseDetailForm';
import { FooterForm } from './FooterForm';
import Modal from "@Components/modal";
import { ModalViewTransfer } from './ModalViewTransfer';
import { ModalCxp } from './ModalCxp';
import { ModalCxc } from './ModalCxc';
import { ModalViewRequest } from '../checkRequest/ModalViewRequest';

const Transfers = (props) => {
  const { setLoading } = props;
  const [lines, setLines] = useState([]);
  const [editingLineIndex, setEditingLineIndex] = useState(null);

  const {
    propsToControlPanel, formStateIndex, onInputChangeIndex, listBanks, listProvider, listCustomer,
    listCurrencyName, listAccountTypes, formValidationIndex, sendForm, openModalViewTransfers,
    setOpenModalViewTransfers, dataTransfers, fnViewTransfer, openModalCxp, setOpenModalCxp,
    openModalCxc, setOpenModalCxc, propsToMsgDelete,
    cxpPayments, fnRemoveCxpPayment, pendingCxp, fnGetPendingCxp, fnApplyCxpPayment,
    openModalUnpaidBill, setOpenModalUnpaidBill,
    cxcPayments, fnRemoveCxcPayment, pendingCxc, fnGetPendingCxc, fnApplyCxcPayment,
    openModalUnpaidInvoice, setOpenModalUnpaidInvoice,
    openModalViewRequest, setOpenModalViewRequest, pendingRequests, fnSelectRequest
  } = useTransfers({ setLoading, lines, setLines, setEditingLineIndex });

  const {
    formStateDetail, onInputChangeDetail, listAccount, formValidationDetail, sendFormDetail,
    fnAddItem, fnEditLine, fnRemoveLine
  } = useTransfersDetail({ setLoading, lines, setLines, editingLineIndex, setEditingLineIndex });

  const propsToTransfersForm = {
    formStateIndex, onInputChangeIndex, listBanks, listProvider, listCurrencyName, listAccountTypes,
    formValidationIndex, sendForm
  }

  const propsToDetailForm = {
    formStateDetail, onInputChangeDetail, listAccount, formValidationDetail, sendFormDetail, fnAddItem,
    lines, fnEditLine, fnRemoveLine, editingLineIndex
  }

  const propsToFoterForm = {
    lines
  }

  const propsToModalViewTransfers = {
    ModalContent: ModalViewTransfer,
    title: "page.transfers.modal.title.viewTransfers",
    open: openModalViewTransfers,
    setOpen: setOpenModalViewTransfers,
    maxWidth: 'lg',
    data: {
      dataTransfers,
      fnViewTransfer
    }
  }

  const propsToModalCxp = {
    ModalContent: ModalCxp,
    title: "page.transfers.modal.title.Cxp",
    open: openModalCxp,
    setOpen: setOpenModalCxp,
    maxWidth: 'lg',
    data: {
      cxpPayments, fnRemoveCxpPayment, openModalUnpaidBill, setOpenModalUnpaidBill,
      pendingCxp, fnGetPendingCxp, fnApplyCxpPayment
    }
  }

  const propsToModalCxc = {
    ModalContent: ModalCxc,
    title: "page.transfers.modal.title.cxc",
    open: openModalCxc,
    setOpen: setOpenModalCxc,
    maxWidth: 'lg',
    data: {
      cxcPayments, fnRemoveCxcPayment, openModalUnpaidInvoice, setOpenModalUnpaidInvoice,
      pendingCxc, fnGetPendingCxc, fnApplyCxcPayment, listCustomer
    }
  }

  const propsToModalViewRequest = {
    ModalContent: ModalViewRequest,
    title: "page.checkRequest.modal.checkRequest.title",
    open: openModalViewRequest,
    setOpen: setOpenModalViewRequest,
    maxWidth: 'lg',
    data: {
      dataList: pendingRequests,
      fnViewRequest: fnSelectRequest
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
              <UseTransfersForm {...propsToTransfersForm} />
              <UseDetailForm {...propsToDetailForm} />
              <FooterForm {...propsToFoterForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewTransfers} />
      <Modal {...propsToModalCxp} />
      <Modal {...propsToModalCxc} />
      <Modal {...propsToModalViewRequest} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Transfers;
