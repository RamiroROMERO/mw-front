import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useTranfers } from './useTranfers';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import Confirmation from '@/containers/ui/confirmationMsg';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import { useTransfersDeta } from './useTransfersDeta';
import FormTransfers from './FormTransfers';
import DetailProduct from './DetailProduct';
import DetailTable from './DetailTable';
import ModalViewTransfers from './ModalViewTransfers';
import FooterTransfers from './FooterTransfers';

const TransferToStores = ({ setLoading }) => {
  const [transferDetail, setTransferDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const { propsToControlPanel, formState, onInputChange, listDocuments, listStores, sendFormDeta, setSendFormDeta, formValidation, sendForm, setSendForm, isFormValid, dataTransfers, openModalViewTransfers, setOpenModalViewTransfers, onBulkForm, listAccounts, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument } = useTranfers({ setLoading, transferDetail, setTransferDetail, onResetFormDeta });

  const { notes, sourceStoreId, assignStoreId, noCtaOrigin, noCtaAssign } = formState;

  const propsToFormTransfers = {
    ...formState,
    onInputChange,
    listDocuments,
    listStores,
    formValidation,
    sendForm,
    listAccounts,
    onBulkForm
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
    transferDetail,
    setTransferDetail,
    sendFormDeta,
    setSendFormDeta,
    isFormValidDeta,
    formValidationDeta,
    setSendForm,
    isFormValid
  }

  const propsToDetailTable = {
    transferDetail,
    setTransferDetail,
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
      <Confirmation {...propsToMsgDeleteDocument} />
    </>
  );
}
export default TransferToStores;