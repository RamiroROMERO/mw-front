import React from 'react'
import { useResumePayroll } from '../resumePayroll/useResumePayroll';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import Modal from '@Components/modal';
import ModalViewPayroll from '../resumePayroll/ModalViewPayroll';
import ControlPanel from '@Components/controlPanel';
import HeaderPayroll from '../resumePayroll/HeaderPayroll';
import DetailTable from '../resumePayroll/DetailTable';
import FooterPayroll from '../resumePayroll/FooterPayroll';
import ModalTypeSheet from '@Components/modalTypeSheet';
import ModalSelectEmployees from './ModalSelectEmployees';

const VacationPayroll = ({setLoading}) => {
  const typePayroll = 4;

  const {openModalPayrolls, openModalPrint, openModalSelectEmployees, setOpenModalPayrolls, setOpenModalPrint, setOpenModalSelectEmployees, propsToControlPanel, propsToDetailTable, propsToHeaderPayroll, propsToModalViewPayroll, propsToModalPrint, propsToModalEmployees, dataTotals} = useResumePayroll({setLoading, typePayroll});

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

  const propsToModalSelectEmployees = {
    ModalContent: ModalSelectEmployees,
    title: "page.resumePayroll.modal.selectEmployees",
    open: openModalSelectEmployees,
    setOpen: setOpenModalSelectEmployees,
    maxWidth: 'lg',
    data: propsToModalEmployees
  }

  const propsToFooter = {
    dataTotals
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
      </Row>
      <Modal {...propsToModalPayrolls} />
      <Modal {...propsToModalPrintReceipt} />
      <Modal {...propsToModalSelectEmployees} />
    </>
  )
}

export default VacationPayroll