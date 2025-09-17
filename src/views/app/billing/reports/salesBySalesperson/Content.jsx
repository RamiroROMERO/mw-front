import React from 'react'
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable'
import Modal from '@Components/modal';
import { useSalesBySalesperson } from './useSalesBySalesperson'
import HeaderReport from './HeaderReport';
import ModalSummary from './ModalSummary';
import ModalNewCustomers from './ModalNewCustomers';

const Content = ({ setLoading }) => {

  const {table, dataSummary, dataNewCustomers, openModalViewSummary, openModalNewCustomers, setOpenModalViewSummary, setOpenModalNewCustomers, propsToHeaderReport} = useSalesBySalesperson({setLoading});

  const propsToModalSummary = {
    ModalContent: ModalSummary,
    title: "page.billingReports.modal.viewSummary.title",
    open: openModalViewSummary,
    setOpen: setOpenModalViewSummary,
    maxWidth: 'lg',
    data: {
      dataSummary
    }
  }

  const propsToModalNewCustomers = {
    ModalContent: ModalNewCustomers,
    title: "page.billingReports.modal.newCustomers.title",
    open: openModalNewCustomers,
    setOpen: setOpenModalNewCustomers,
    maxWidth: 'lg',
    data: {
      dataNewCustomers
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className='mb-3'>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
          <Row>
            <Colxx xxs="12">
              <ReactTable {...table} />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Modal {...propsToModalSummary} />
      <Modal {...propsToModalNewCustomers} />
    </>
  )
}

export default Content