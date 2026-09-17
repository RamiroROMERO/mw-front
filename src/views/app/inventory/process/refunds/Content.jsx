import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import { useTransfersDeta } from '../transferToStores/useTransfersDeta';
import { useRefunds } from './useRefunds';
import DetailProduct from '../transferToStores/DetailProduct';
import DetailTable from '../transferToStores/DetailTable';
import FooterTransfers from '../transferToStores/FooterTransfers';
import ModalViewTransfers from '../transferToStores/ModalViewTransfers';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import FormRefunds from './FormRefunds';

const Refunds = ({ setLoading }) => {
  const [refundDetail, setRefundDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, fnSelectProduct, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, listDestinations, listAccounts,
    listProviders, listTypeApply, showType1, showType2, setShowType1, setShowType2, onBulkForm, sendFormDeta,
    setSendFormDeta, sendForm, setSendForm, isFormValid, formValidation, openModalViewRefunds, setOpenModalViewRefunds,
    dataRefunds, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument,
    disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess, fnProcessRefund,
    openModalVoid, setOpenModalVoid, fnVoidRefund
  } = useRefunds({ refundDetail, onResetFormDeta, setRefundDetail, setLoading });

  const { notes, sourceStoreId, assignStoreId, noCtaOrigin, noCtaAssign, documentCode, documentId, pdaNumber } = formState;

  const { idProd } = formStateDeta;

  const propsToFormRefunds = {
    ...formState,
    onInputChange,
    listDocuments,
    listStores,
    listDestinations,
    listAccounts,
    listProviders,
    listTypeApply,
    showType1,
    showType2,
    setShowType1,
    setShowType2,
    onBulkForm,
    refundDetail,
    setRefundDetail,
    idProd,
    onResetFormDeta,
    sendForm,
    formValidation,
    disabled,
    isProcessed,
    isVoided,
    pdaNumber
  }

  const propsToDetailProduct = {
    ...formStateDeta,
    sourceStoreId,
    assignStoreId,
    noCtaOrigin,
    noCtaAssign,
    onInputChangeDeta,
    fnViewProducts,
    setBulkFormDeta,
    transferDetail: refundDetail,
    setTransferDetail: setRefundDetail,
    sendFormDeta,
    setSendFormDeta,
    isFormValidDeta,
    formValidationDeta,
    setSendForm,
    isFormValid,
    disabled
  }

  const propsToDetailTable = {
    transferDetail: refundDetail,
    setTransferDetail: setRefundDetail,
    setBulkFormDeta,
    disabled
  }

  const propsToFooter = {
    notes,
    onInputChange,
    disabled
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts,
      fnSelectItem: fnSelectProduct
    }
  }

  const propsToModalViewRefunds = {
    ModalContent: ModalViewTransfers,
    title: "page.refunds.modal.viewRefunds.title",
    open: openModalViewRefunds,
    setOpen: setOpenModalViewRefunds,
    maxWidth: "lg",
    data: {
      dataTransfers: dataRefunds,
      onBulkForm,
      fnGetDataDetail
    }
  }

  const propsToMsgDeleteDocument = {
    open: openMsgDeleteDocument,
    setOpen: setOpenMsgDeleteDocument,
    fnOnOk: fnOkDeleteDocument,
    title: "alert.question.title"
  }

  const propsToModalVoid = {
    ModalContent: ModalVoidInvoice,
    title: "button.cancel2",
    open: openModalVoid,
    setOpen: setOpenModalVoid,
    maxWidth: 'md',
    data: {
      invoiceNumber: `${documentCode}-${documentId}`,
      fnConfirm: fnVoidRefund
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessRefund,
    title: "msg.question.processRefund.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormRefunds {...propsToFormRefunds} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
              <FooterTransfers {...propsToFooter} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewRefunds} />
      <Modal {...propsToModalVoid} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default Refunds;
