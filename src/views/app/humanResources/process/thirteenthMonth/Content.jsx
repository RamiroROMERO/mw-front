import React from 'react'
import { useResumePayroll } from '../resumePayroll/useResumePayroll';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import ModalViewPayroll from '../resumePayroll/ModalViewPayroll';
import HeaderPayroll from '../resumePayroll/HeaderPayroll';
import DetailTable from '../resumePayroll/DetailTable';
import FooterPayroll from '../resumePayroll/FooterPayroll';
import ModalTypeSheet from '@Components/modalTypeSheet';

const ThirteenthMonth = ({setLoading, screenControl, adminControl}) => {
  const typePayroll = 2;

  const {openModalPayrolls, openModalPrint,  setOpenModalPayrolls, setOpenModalPrint, propsToControlPanel, propsToDetailTable, propsToHeaderPayroll, propsToModalViewPayroll, propsToModalPrint, dataTotals} = useResumePayroll({setLoading, typePayroll, screenControl, adminControl});

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
    </>
  )
}

export default ThirteenthMonth