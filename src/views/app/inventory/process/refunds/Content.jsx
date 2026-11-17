import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useRefunds } from './useRefunds';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import { useTransfersDeta } from '../transactions/shared/useTransfersDeta';
import FormRefunds from './FormRefunds';
import DetailProduct from '../transactions/shared/DetailProduct';
import DetailTable from '../transactions/shared/DetailTable';
import ModalViewTransfers from '../transactions/shared/ModalViewTransfers';
import FooterTransfers from '../transactions/shared/FooterTransfers';
import ModalAddManyProducts from '../transactions/shared/ModalAddManyProducts';

const Refunds = ({ setLoading }) => {
  const [refundDetail, setRefundDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, fnSelectProduct, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, listDestinations, listAccounts, providerSelectOptions, onProviderSearch,
    onStoreChange, onDestinationChange, onApplyToChange, onProviderChange, onTypeChange, isProviderMode, isStoreMode, sendFormDeta, setSendFormDeta,
    formValidation, sendForm, setSendForm, isFormValid, dataRefunds, openModalViewRefunds, setOpenModalViewRefunds, onBulkForm, fnGetDataDetail,
    openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument, disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess,
    fnProcessRefund, openModalVoid, setOpenModalVoid, fnVoidRefund, openModalAddMany, setOpenModalAddMany, fnAddManyLine
  } = useRefunds({ setLoading, refundDetail, setRefundDetail, onResetFormDeta });

  const { notes, sourceStoreId, assignStoreId, originCtaCode, assignCtaCode, documentCode, documentId } = formState;

  const propsToFormRefunds = {
    ...formState,
    onInputChange,
    listDocuments,
    listStores,
    listDestinations,
    listAccounts,
    providerSelectOptions,
    onProviderSearch,
    onStoreChange,
    onDestinationChange,
    onApplyToChange,
    onProviderChange,
    onTypeChange,
    isProviderMode,
    isStoreMode,
    sendForm,
    formValidation,
    disabled,
    isProcessed,
    isVoided
  }

  const propsToDetailProduct = {
    ...formStateDeta,
    sourceStoreId,
    assignStoreId,
    originCtaCode,
    assignCtaCode,
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

  const propsToModalAddMany = {
    ModalContent: ModalAddManyProducts,
    title: "page.transfersToStores.button.addMany",
    open: openModalAddMany,
    setOpen: setOpenModalAddMany,
    maxWidth: 'lg',
    data: {
      url: 'inventory/process/refunds/availableProducts',
      storeId: sourceStoreId,
      fnAddLine: fnAddManyLine
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
      <Modal {...propsToModalAddMany} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default Refunds;