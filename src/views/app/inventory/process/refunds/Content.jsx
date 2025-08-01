import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import Confirmation from '@/containers/ui/confirmationMsg';
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

  const { formStateDeta, onInputChangeDeta, fnViewProducts, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const { propsToControlPanel, formState, onInputChange, listDocuments, listStores, listDestinations, listAccounts, listProviders, listTypeApply, showType1, showType2, setShowType1, setShowType2, onBulkForm, sendFormDeta, setSendFormDeta, sendForm, setSendForm, isFormValid, formValidation, openModalViewRefunds, setOpenModalViewRefunds, dataRefunds, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument } = useRefunds({ refundDetail, onResetFormDeta, setRefundDetail, setLoading });

  const { notes, sourceStoreId, assignStoreId, noCtaOrigin, noCtaAssign } = formState;

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
    idProd,
    onResetFormDeta,
    sendForm,
    formValidation
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
    isFormValid
  }

  const propsToDetailTable = {
    transferDetail: refundDetail,
    setTransferDetail: setRefundDetail,
    setBulkFormDeta
  }

  const propsToFooter = {
    notes,
    onInputChange
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
      <Confirmation {...propsToMsgDeleteDocument} />
    </>
  );
}
export default Refunds;