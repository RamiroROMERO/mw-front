import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable'
import Modal from '@Components/modal';
import { useBoxesReport } from './useBoxesReport';
import HeaderReport from './HeaderReport';
import ModalSummary from './ModalSummary';

const BoxesReport = ({ setLoading }) => {

  const { table, propsToHeaderReport, openModalSummary, setOpenModalSummary } = useBoxesReport({ setLoading });

   const propsToModalSummary = {
    ModalContent: ModalSummary,
    title: "page.billingReports.modal.viewSummaryPayments.title",
    open: openModalSummary,
    setOpen: setOpenModalSummary,
    maxWidth: 'lg',
    data: {
      setLoading
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
    </>
  );
}
export default BoxesReport;