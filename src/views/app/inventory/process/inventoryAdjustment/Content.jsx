import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useInventory } from './useInventory';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import Confirmation from '@/containers/ui/confirmationMsg';
import { useTransfersDeta } from '../transferToStores/useTransfersDeta';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import DetailProduct from '../transferToStores/DetailProduct';
import FormInventory from './FormInventory';
import DetailTable from '../transferToStores/DetailTable';
import ModalViewTransfers from '../transferToStores/ModalViewTransfers';

const InventoryAdjustment = ({ setLoading }) => {
  const [inventoryDetail, setInventoryDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const { propsToControlPanel, formState, onInputChange, listDocuments, listStores, listTypeApply, sendForm, setSendForm, sendFormDeta, setSendFormDeta, isFormValid, formValidation, dataInventory, openModalViewInventoryAd, setOpenModalViewInventoryAd, onBulkForm, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument } = useInventory({ inventoryDetail, setInventoryDetail, onResetFormDeta, setLoading });

  const { sourceStoreId } = formState;

  const propsToFormInventory = {
    ...formState,
    onInputChange,
    listDocuments,
    listStores,
    listTypeApply,
    sendForm,
    formValidation
  }

  const propsToDetailProduct = {
    ...formStateDeta,
    sourceStoreId,
    assignStoreId: 0,
    noCtaOrigin: '',
    noCtaAssign: '',
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
    isFormValid
  }

  const propsToDetailTable = {
    transferDetail: inventoryDetail,
    setTransferDetail: setInventoryDetail,
    setBulkFormDeta
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts
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
      <Confirmation {...propsToMsgDeleteDocument} />
    </>
  );
}
export default InventoryAdjustment;