import React from 'react'
import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalTypeSheet from '@Components/modalTypeSheet';
import HeaderPayroll from './HeaderPayroll'
import DetailTable from './DetailTable'
import ModalViewPayroll from './ModalViewPayroll'
import FooterPayroll from './FooterPayroll';
import ModalDeducctions from './ModalDeductions';
import { useResumePayroll } from './useResumePayroll';
import ModalIncomes from './ModalIncomes';

const BiweeklyPayroll = ({ setLoading, screenControl, adminControl }) => {
  const typePayroll = 1;

  const { openModalPayrolls, openModalPrint, openModalDeductions, openModalIncomes, setOpenModalPayrolls, setOpenModalPrint, setOpenModalDeductions, setOpenModalIncomes, propsToControlPanel, propsToDetailTable, propsToHeaderPayroll, propsToModalViewPayroll, propsToModalPrint, propsToModalDeductions, propsToModalIncomes, dataTotals, propsToMsgDelete, propsToViewPDF } = useResumePayroll({ setLoading, typePayroll, screenControl, adminControl });

  const propsToModalPayrolls = {
    ModalContent: ModalViewPayroll,
    title: "page.resumePayroll.modal.viewPayrolls.title",
    open: openModalPayrolls,
    setOpen: setOpenModalPayrolls,
    maxWidth: 'lg',
    data: propsToModalViewPayroll
  }

  const propsToModalPrintReceipt = {
    ModalContent: ModalTypeSheet,
    title: "button.printPaymentReceipt",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: "sm",
    data: propsToModalPrint
  }

  const propsToModalAddDeductions = {
    ModalContent: ModalDeducctions,
    title: "page.deductions.table.title",
    open: openModalDeductions,
    setOpen: setOpenModalDeductions,
    maxWidth: 'lg',
    data: propsToModalDeductions
  }

  const propsToModalAddIncomes = {
    ModalContent: ModalIncomes,
    title: "page.biweeklyPayroll.label.income",
    open: openModalIncomes,
    setOpen: setOpenModalIncomes,
    maxWidth: 'lg',
    data: propsToModalIncomes
  }

  const propsToFooter = {
    dataTotals,
    typePayroll
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <HeaderPayroll {...propsToHeaderPayroll} />
              <DetailTable {...propsToDetailTable} />
              <FooterPayroll {...propsToFooter}/>
            </CardBody>
          </Card>
        </Colxx>
        <Modal {...propsToModalPayrolls} />
        <Modal {...propsToModalPrintReceipt} />
        <Modal {...propsToModalAddDeductions} />
        <Modal {...propsToModalAddIncomes} />
        <Modal {...propsToViewPDF} />
      </Row>
      <Confirmation {...propsToMsgDelete}/>
    </>
  )
}

export default BiweeklyPayroll