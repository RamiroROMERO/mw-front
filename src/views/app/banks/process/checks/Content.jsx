import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import ControlPanel from '@/components/controlPanel';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import { useChecks } from './useChecks';
import { UseChecksForm } from './UseChecksForm';
import { useChecksDetail } from './useChecksDetail';
import { UseDetailForm } from './UseDetailForm';
import { FooterForm } from './FooterForm';
import Modal from "@/components/modal";
import { ModalViewCheck } from './ModalViewCheck';
import { ModalPrintCheck } from './ModalPrintCheck';
import { ModalExpenses } from './ModalExpenses';
import { ModalViewRequest } from '../checkRequest/ModalViewRequest';
import { ModalAnticiped } from './ModalAnticiped';
import { ModalCxp } from './ModalCxp';
import { ModalCxc } from './ModalCxc';

const Checks = (props) => {
  const { setLoading } = props;
  const { formStateDetail, onInputChangeDetail, onResetFormDetail, setBulkFormDetail, listAccount, formValidationDetail, sendFormDetail, setSendFormDetail, isFormValidDetail } = useChecksDetail({ setLoading });

  const { propsToControlPanel, formStateIndex, setBulkFormIndex, onInputChangeIndex, onResetFormIndex, listDocto, listBanks, listProvider, listCurrencyName, listCityName, listCustomer, openModalViewChecks, setOpenModalViewChecks, dataChecks, fnViewCheck, openModalPrintCheck, setOpenModalPrintCheck, openModalViewRequest, setOpenModalViewRequest, formValidationIndex, sendForm, openModalExpenses, setOpenModalExpenses, dataExpenses, openModalAnticiped, setOpenModalAnticiped, openModalCxc, setOpenModalCxc, openModalCxp, setOpenModalCxp, } = useChecks({ setSendFormDetail, onResetFormDetail, setLoading });

  const propsToChecksForm = {
    formStateIndex, onInputChangeIndex, listDocto, listBanks, listProvider, listCurrencyName, listCityName, formValidationIndex, sendForm, setBulkFormDetail
  }

  const propsToDetailForm = {
    formStateDetail, onInputChangeDetail, listAccount, formValidationDetail, isFormValidDetail, sendFormDetail, setSendFormDetail, onResetFormDetail
  }

  const propsToFoterForm = {
    formStateIndex,
    onInputChangeIndex,
    listProvider,
    listCustomer
  }

  const propsToModalViewChecks = {
    ModalContent: ModalViewCheck,
    title: "page.checks.modal.title.viewChecks",
    open: openModalViewChecks,
    setOpen: setOpenModalViewChecks,
    maxWidth: 'lg',
    data: {
      dataChecks,
      fnViewCheck
    }
  }

  const propsToModalPrintCheck = {
    ModalContent: ModalPrintCheck,
    title: "page.checks.modal.title.printCheck",
    open: openModalPrintCheck,
    setOpen: setOpenModalPrintCheck,
    maxWidth: 'xs',
    data: {
      dataExpenses
    }
  }

  const propsToModalExpenses = {
    ModalContent: ModalExpenses,
    title: "page.checks.modal.title.expenses",
    open: openModalExpenses,
    setOpen: setOpenModalExpenses,
    maxWidth: 'lg',
    data: {
    }
  }

  const propsToModalAnticiped = {
    ModalContent: ModalAnticiped,
    title: "page.checks.modal.title.anticiped",
    open: openModalAnticiped,
    setOpen: setOpenModalAnticiped,
    maxWidth: 'md',
    data: {
      listProvider
    }
  }

  const propsToModalViewRequest = {
    ModalContent: ModalViewRequest,
    title: "page.checkRequest.modal.checkRequest.title",
    open: openModalViewRequest,
    setOpen: setOpenModalViewRequest,
    maxWidth: 'lg',
    data: {
    }
  }

  const propsToModalCxp = {
    ModalContent: ModalCxp,
    title: "page.checks.modal.title.Cxp",
    open: openModalCxp,
    setOpen: setOpenModalCxp,
    maxWidth: 'lg',
    data: {
    }
  }

  const propsToModalCxc = {
    ModalContent: ModalCxc,
    title: "page.checks.modal.title.cxc",
    open: openModalCxc,
    setOpen: setOpenModalCxc,
    maxWidth: 'lg',
    data: {
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
              <UseChecksForm {...propsToChecksForm} />
              <UseDetailForm {...propsToDetailForm} />
              <FooterForm {...propsToFoterForm} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewChecks} />
      <Modal {...propsToModalPrintCheck} />
      <Modal {...propsToModalViewRequest} />
      <Modal {...propsToModalExpenses} />
      <Modal {...propsToModalAnticiped} />
      <Modal {...propsToModalCxp} />
      <Modal {...propsToModalCxc} />
    </>
  );
}
export default Checks;