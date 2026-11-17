import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useTranfers } from './useTranfers';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import { useTransfersDeta } from '../transactions/shared/useTransfersDeta';
import FormTransfers from './FormTransfers';
import DetailProduct from '../transactions/shared/DetailProduct';
import DetailTable from '../transactions/shared/DetailTable';
import ModalViewTransfers from '../transactions/shared/ModalViewTransfers';
import FooterTransfers from '../transactions/shared/FooterTransfers';
import ModalAddManyProducts from '../transactions/shared/ModalAddManyProducts';

const TransferToStores = ({ setLoading }) => {
  const [transferDetail, setTransferDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, fnSelectProduct, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, sendFormDeta, setSendFormDeta,
    formValidation, sendForm, setSendForm, isFormValid, dataTransfers, openModalViewTransfers, setOpenModalViewTransfers,
    onBulkForm, listAccounts, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument,
    disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess, fnProcessTransfer,
    openModalVoid, setOpenModalVoid, fnVoidTransfer, openModalAddMany, setOpenModalAddMany, fnAddManyLine
  } = useTranfers({ setLoading, transferDetail, setTransferDetail, onResetFormDeta });

  const { notes, senderName, receiverName, sourceStoreId, assignStoreId, originCtaCode, assignCtaCode, documentCode, documentId, pdaNumber } = formState;

  const propsToFormTransfers = {
    ...formState,
    senderName,
    receiverName,
    onInputChange,
    listDocuments,
    listStores,
    formValidation,
    sendForm,
    listAccounts,
    onBulkForm,
    disabled,
    isProcessed,
    isVoided,
    pdaNumber
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
    transferDetail,
    setTransferDetail,
    sendFormDeta,
    setSendFormDeta,
    isFormValidDeta,
    formValidationDeta,
    setSendForm,
    isFormValid,
    disabled
  }

  const propsToDetailTable = {
    transferDetail,
    setTransferDetail,
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

  const propsToModalViewTransfers = {
    ModalContent: ModalViewTransfers,
    title: "page.transfersToStores.modal.viewTransfers.title",
    open: openModalViewTransfers,
    setOpen: setOpenModalViewTransfers,
    maxWidth: "lg",
    data: {
      dataTransfers,
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
      url: 'inventory/process/transfers/availableProducts',
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
      fnConfirm: fnVoidTransfer
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessTransfer,
    title: "msg.question.processTransfer.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormTransfers {...propsToFormTransfers} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
              <FooterTransfers {...propsToFooter} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewTransfers} />
      <Modal {...propsToModalVoid} />
      <Modal {...propsToModalAddMany} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default TransferToStores;