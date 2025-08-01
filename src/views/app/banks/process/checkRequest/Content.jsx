import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import { useCheckRequest } from './useCheckRequest';
import { RequestForm } from './RequestForm';
import { useCheckRequestDetail } from './useCheckRequestDetail';
import { RequestDetail } from './RequestDetail';
import { FooterForm } from './FooterForm';
import Modal from "@/components/modal";
import { ModalAccountPayable } from './ModalAccountPayable';
import { ModalViewRequest } from './ModalViewRequest';
import ModalChecksPayroll from './ModalChecksPayroll';

const CheckRequest = (props) => {
  const { setLoading } = props;

  const { formStateDetail, setBulkFormDetail, onInputChangeDetail, onResetFormDetail, openModalAccountPayable, setOpenModalAccountPayable, listCxp, setListCxp, fnViewCxp, } = useCheckRequestDetail({ setLoading });

  const { propsToControlPanel, formStateIndex, setBulkFormIndex, onInputChangeIndex, onResetFormIndex, listBeneficiary, listAccountType, openModalViewRequest, setOpenModalViewRequest, formValidationIndex, sendForm, openModalCheckPayroll, setOpenModalCheckPayroll } = useCheckRequest({ setLoading, onResetFormDetail });

  const propsToCheckRequestForm = {
    onInputChangeIndex, formStateIndex, listBeneficiary, listAccountType, setBulkFormIndex, openModalViewRequest, formValidationIndex, setOpenModalViewRequest, sendForm, openModalCheckPayroll, setOpenModalCheckPayroll
  }

  const propsToCheckRequestDetail = {
    onInputChangeDetail, formStateDetail, listCxp, setListCxp, fnViewCxp,
  }

  const propsToFooterForm = {
    onInputChangeIndex, formStateIndex, formValidationIndex, sendForm
  }

  const propsToModalPayable = {
    ModalContent: ModalAccountPayable,
    title: "page.checkRequest.modal.billToPay.title",
    open: openModalAccountPayable,
    setOpen: setOpenModalAccountPayable,
    maxWidth: 'lg',
    data: {
      listCxp
    }
  }

  const propsToModalViewRequest = {
    ModalContent: ModalViewRequest,
    title: "page.checkRequest.modal.checkRequest.title",
    open: openModalViewRequest,
    setOpen: setOpenModalViewRequest,
    maxWidth: 'lg',
    data: {
      listCxp
    }
  }

  const propsToModalChecksPayroll = {
    ModalContent: ModalChecksPayroll,
    title: "page.checkRequest.modal.checkPayroll.title",
    open: openModalCheckPayroll,
    setOpen: setOpenModalCheckPayroll,
    maxWidth: 'xl',
    data: {
      listRequest: [],
      fnViewRequest: (data) => { console.log(data) }
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
              <RequestForm {...propsToCheckRequestForm} />
              <RequestDetail {...propsToCheckRequestDetail} />
              <FooterForm {...propsToFooterForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPayable} />
      <Modal {...propsToModalViewRequest} />
      <Modal {...propsToModalChecksPayroll} />
    </>
  );
}
export default CheckRequest;