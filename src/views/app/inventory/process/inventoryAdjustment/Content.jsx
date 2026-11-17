import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useInventory } from './useInventory';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import ModalAddManyProducts from '../transactions/shared/ModalAddManyProducts';
import FormInventory from './FormInventory';
import DetailTable from '../transactions/shared/DetailTable';
import ModalViewTransfers from '../transactions/shared/ModalViewTransfers';

const InventoryAdjustment = ({ setLoading }) => {
  const [inventoryDetail, setInventoryDetail] = useState([]);

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, sendForm, setSendForm,
    isFormValid, formValidation, dataInventory, openModalViewInventoryAd,
    setOpenModalViewInventoryAd, onBulkForm, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument,
    fnOkDeleteDocument, disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess, fnProcessAdjustment,
    openModalVoid, setOpenModalVoid, fnVoidAdjustment, openMsgAddRemaining, setOpenMsgAddRemaining, fnAddRemaining, openModalAddMany, setOpenModalAddMany, fnAddManyLine, dateWarning
  } = useInventory({ inventoryDetail, setInventoryDetail, setLoading });

  const { sourceStoreId, documentCode, documentId, pdaNumber } = formState;


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
    pdaNumber,
    dateWarning
  }

  const propsToDetailTable = {
    transferDetail: inventoryDetail,
    setTransferDetail: setInventoryDetail,
    setBulkFormDeta: () => { },
    disabled,
    showLot: true,
    hideEdit: true
  }

  const propsToModalAddMany = {
    ModalContent: ModalAddManyProducts,
    title: "page.transfersToStores.button.addMany",
    open: openModalAddMany,
    setOpen: setOpenModalAddMany,
    maxWidth: 'lg',
    data: {
      url: 'inventory/process/adjustments/availableProducts',
      storeId: sourceStoreId,
      showLot: true,
      fnAddLine: fnAddManyLine
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
              <DetailTable {...propsToDetailTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAddMany} />
      <Modal {...propsToModalViewInventoryAd} />
      <Modal {...propsToModalVoid} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
      <Confirmation {...propsToMsgAddRemaining} />
    </>
  );
}
export default InventoryAdjustment;
