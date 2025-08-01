/* eslint-disable react/prop-types */
import React from 'react'
import { useNeighborhoodTax } from './useNeighborhoodTax'
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import HeaderPayroll from './HeaderPayroll';
import DetailTable from './DetailTable';
import ModalViewPayroll from '../resumePayroll/ModalViewPayroll';
import FooterPayroll from '../resumePayroll/FooterPayroll';

const Content = ({setLoading}) => {
  const typePayroll = 5;

  const {dataTotals, propsToControlPanel, propsToHeaderPayroll, propsToDetailTable, propsToModalViewPayroll, openModalPayrolls, setOpenModalPayrolls} = useNeighborhoodTax({setLoading, typePayroll});

  const propsToModalPayrolls = {
    ModalContent: ModalViewPayroll,
    title: "page.resumePayroll.modal.viewPayrolls.title",
    open: openModalPayrolls,
    setOpen: setOpenModalPayrolls,
    maxWidth: 'lg',
    data: propsToModalViewPayroll
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
      </Row>
      <Modal {...propsToModalPayrolls} />
    </>
  )
}

export default Content