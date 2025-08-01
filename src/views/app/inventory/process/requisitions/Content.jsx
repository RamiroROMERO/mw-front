import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import Confirmation from '@/containers/ui/confirmationMsg';
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

  const { formStateDeta, onInputChangeDeta, fnViewProducts, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const { propsToControlPanel, formState, onInputChange, listDocuments, listStores, listDestinations, listTypeApply, sendFormDeta, setSendFormDeta, sendForm, setSendForm, formValidation, isFormValid, listWorkOrders, onBulkForm, showWorkOrder, setShowWorkOrder, openModalViewRequisitions, setOpenModalViewRequisitions, dataRequisitions, listAccounts, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument } = useRequisitions({ requisitionDetail, onResetFormDeta, setRequisitionDetail, setLoading });

  const { notes, sourceStoreId, assignStoreId, assignOT, workOrderId, noCtaOrigin, noCtaAssign } = formState;

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
    idProd,
    onResetFormDeta
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
    isFormValid
  }

  const propsToDetailTable = {
    transferDetail: requisitionDetail,
    setTransferDetail: setRequisitionDetail,
    setBulkFormDeta
  }

  const propsToFooter = {
    notes,
    assignOT,
    workOrderId,
    onInputChange,
    listWorkOrders,
    onBulkForm,
    showWorkOrder,
    setShowWorkOrder
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
      <Confirmation {...propsToMsgDeleteDocument} />
    </>
  );
}
export default Requisitions;