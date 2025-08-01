import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from "@/components/modal";
import RetentionForm from './RetentionForm';
import RetentionDetail from './RetentionDetail';
import FooterOrder from './FooterOrder';
import ModalViewRetention from './ModalViewRetention';
import ModalBillToPay from './ModalBillToPay';
import { useRetentionReceipt } from './useRetentionReceipt';
import { useRetentionDetail } from './useRetentionDetail';
import ModalPrintRetention from './ModalPrintRetention';

const RetentionReceipt = (props) => {
  const { setLoading } = props;
  const [retentionDetail, setRetentionDetail] = useState([]);

  const { formDetail, setBulkFormDetail, onInputDetaChange, onResetFormDetail, formValidationDetail, isFormValidDeta, fnViewOrderDetail, sendFormDeta, setSendFormDeta } = useRetentionDetail({ setLoading, setRetentionDetail });

  const { propsToControlPanel, formStateIndex, formValidationIndex, onInputChangeIndex, setBulkFormIndex, sendForm, dataRetention, openModalRetention, setOpenModalRetention, openMsgDelete, setOpenMsgDelete, fnOkDeleteRetention, listProvider, listDocto, listTypesRetention, listCxp, fnViewCxp, openModalBillToPay, setOpenModalBillToPay, openModalPrint, setOpenModalPrint } = useRetentionReceipt({ setLoading, onResetFormDetail, retentionDetail, setRetentionDetail, setSendFormDeta, setBulkFormDetail });

  const { id: code, date, documentCode: codeIndex, documentId, cai, numberCAI, limitDate,
    providerId, rangeCAI, total } = formStateIndex;

  const { id, documentCode, description, baseValue, percentValue, totalValue } = formDetail;

  const propsToRetentionForm = {
    code, date, documentCode: codeIndex, listDocto, documentId, cai, numberCAI, limitDate, providerId, listProvider, rangeCAI, setBulkFormIndex, onInputChangeIndex, formValidationIndex, sendForm
  }

  const propsToRetentionDetail = {
    id, documentCode, description, baseValue, percentValue,
    totalValue, listTypesRetention, onInputDetaChange, retentionDetail,
    fnViewCxp, setBulkFormDetail, sendFormDeta, isFormValidDeta,
    setSendFormDeta, setBulkFormIndex, setRetentionDetail, formValidationDetail
  }

  const propsToFooterOrder = {
    total, onInputChangeIndex, setBulkFormIndex
  }

  const propsToModalBillToPay = {
    ModalContent: ModalBillToPay,
    title: "page.invoicing.modal.billToPay.title",
    open: openModalBillToPay,
    setOpen: setOpenModalBillToPay,
    maxWidth: 'lg',
    data: {
      listCxp
    }
  }

  const propsToModalRetention = {
    ModalContent: ModalViewRetention,
    title: "page.retentionReceipt.modal.invoices.title",
    open: openModalRetention,
    setOpen: setOpenModalRetention,
    maxWidth: 'lg',
    data: {
      dataRetention,
      fnViewOrderDetail,
      setBulkFormIndex
    }
  }

  const propsToMsgDelete = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnOkDeleteRetention,
    title: "alert.question.title"
  }

  const propsToModalPrintRetention = {
    ModalContent: ModalPrintRetention,
    title: "modal.printDocument.title",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: 'sm',
    data: {
      id: code,
      setLoading
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <RetentionForm {...propsToRetentionForm} />
              <RetentionDetail {...propsToRetentionDetail} />
              <FooterOrder {...propsToFooterOrder} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalRetention} />
      <Modal {...propsToModalBillToPay} />
      <Modal {...propsToModalPrintRetention} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default RetentionReceipt;