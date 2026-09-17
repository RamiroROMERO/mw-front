import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import { useTransfersDeta } from '../transferToStores/useTransfersDeta';
import { useRequisitions } from './useRequisitions';
import DetailProduct from '../transferToStores/DetailProduct';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewTransfers from '../transferToStores/ModalViewTransfers';
import DetailTable from '../transferToStores/DetailTable';
import FormRequisitions from './FormRequisitions';
import FooterRequisitions from './FooterRequisitions';

const Requisitions = ({ setLoading }) => {
  const [requisitionDetail, setRequisitionDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, fnSelectProduct, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, listDestinations, listTypeApply,
    sendFormDeta, setSendFormDeta, sendForm, setSendForm, formValidation, isFormValid, listWorkOrders, onBulkForm,
    showWorkOrder, setShowWorkOrder, openModalViewRequisitions, setOpenModalViewRequisitions, dataRequisitions,
    listAccounts, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument,
    disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess, fnProcessRequisition,
    openModalVoid, setOpenModalVoid, fnVoidRequisition
  } = useRequisitions({ requisitionDetail, onResetFormDeta, setRequisitionDetail, setLoading });

  const { notes, sourceStoreId, assignStoreId, isWorkOrder, workOrderId, noCtaOrigin, noCtaAssign, documentCode, documentId, pdaNumber } = formState;

  const { idProd } = formStateDeta;

  const propsToFormRequisition = {
    ...formState,
    onInputChange,
    listDocuments,
    listStores,
    listDestinations,
    listTypeApply,
    formValidation,
    sendForm,
    listAccounts,
    onBulkForm,
    requisitionDetail,
    setRequisitionDetail,
    idProd,
    onResetFormDeta,
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
    transferDetail: requisitionDetail,
    setTransferDetail: setRequisitionDetail,
    sendFormDeta,
    setSendFormDeta,
    isFormValidDeta,
    formValidationDeta,
    setSendForm,
    isFormValid,
    disabled
  }

  const propsToDetailTable = {
    transferDetail: requisitionDetail,
    setTransferDetail: setRequisitionDetail,
    setBulkFormDeta,
    disabled
  }

  const propsToFooter = {
    notes,
    isWorkOrder,
    workOrderId,
    onInputChange,
    listWorkOrders,
    onBulkForm,
    showWorkOrder,
    setShowWorkOrder,
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

  const propsToModalViewRequisitions = {
    ModalContent: ModalViewTransfers,
    title: "page.requisitions.modal.viewTransfers.title",
    open: openModalViewRequisitions,
    setOpen: setOpenModalViewRequisitions,
    maxWidth: "lg",
    data: {
      dataTransfers: dataRequisitions,
      fnGetDataDetail,
      onBulkForm
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
      fnConfirm: fnVoidRequisition
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessRequisition,
    title: "msg.question.processRequisition.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormRequisitions {...propsToFormRequisition} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
              <FooterRequisitions {...propsToFooter} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewRequisitions} />
      <Modal {...propsToModalVoid} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default Requisitions;
