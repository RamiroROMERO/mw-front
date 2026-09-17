import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useInventory } from './useInventory';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import { useTransfersDeta } from '../transferToStores/useTransfersDeta';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import DetailProduct from './DetailProduct';
import FormInventory from './FormInventory';
import DetailTable from '../transferToStores/DetailTable';
import ModalViewTransfers from '../transferToStores/ModalViewTransfers';

const InventoryAdjustment = ({ setLoading }) => {
  const [inventoryDetail, setInventoryDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, fnSelectProduct, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, sendForm, setSendForm,
    sendFormDeta, setSendFormDeta, isFormValid, formValidation, dataInventory, openModalViewInventoryAd,
    setOpenModalViewInventoryAd, onBulkForm, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument,
    fnOkDeleteDocument, disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess, fnProcessAdjustment,
    openModalVoid, setOpenModalVoid, fnVoidAdjustment, openMsgAddRemaining, setOpenMsgAddRemaining, fnAddRemaining
  } = useInventory({ inventoryDetail, setInventoryDetail, onResetFormDeta, setLoading });

  const { sourceStoreId, documentCode, documentId, pdaNumber } = formState;

  const { idProd } = formStateDeta;

  const propsToFormInventory = {
    ...formState,
    onInputChange,
    listDocuments,
    listStores,
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
    onInputChangeDeta,
    fnViewProducts,
    setBulkFormDeta,
    transferDetail: inventoryDetail,
    setTransferDetail: setInventoryDetail,
    sendFormDeta,
    setSendFormDeta,
    isFormValidDeta,
    formValidationDeta,
    setSendForm,
    isFormValid,
    idProd,
    disabled
  }

  const propsToDetailTable = {
    transferDetail: inventoryDetail,
    setTransferDetail: setInventoryDetail,
    setBulkFormDeta,
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

  const propsToModalViewInventoryAd = {
    ModalContent: ModalViewTransfers,
    title: "page.inventoryAdjustment.modal.viewInventoryAd.title",
    open: openModalViewInventoryAd,
    setOpen: setOpenModalViewInventoryAd,
    maxWidth: "lg",
    data: {
      dataTransfers: dataInventory,
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
      fnConfirm: fnVoidAdjustment
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessAdjustment,
    title: "msg.question.processAdjustment.title"
  }

  const propsToMsgAddRemaining = {
    open: openMsgAddRemaining,
    setOpen: setOpenMsgAddRemaining,
    fnOnOk: fnAddRemaining,
    title: "msg.question.addRemaining.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormInventory {...propsToFormInventory} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewInventoryAd} />
      <Modal {...propsToModalVoid} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
      <Confirmation {...propsToMsgAddRemaining} />
    </>
  );
}
export default InventoryAdjustment;
