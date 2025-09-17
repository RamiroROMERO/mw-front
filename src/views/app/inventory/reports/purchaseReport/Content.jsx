import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import ReactTable from '@/components/reactTable'
import HeaderReport from './HeaderReport';
import TotalsReport from './TotalsReport';
import ModalOtherReports from './ModalOtherReports';
import { usePurchaseReport } from './usePurchaseReport';

const PurchaseReport = ({ setLoading }) => {

  const { table, dataTotals, propsToHeaderReport, listProviders, listStores, listProducts, openModalOtherReport, setOpenModalOtherReport } = usePurchaseReport({ setLoading });

  const propsToTotals = {
    ...dataTotals
  }

  const propsToModalOtherReports = {
    ModalContent: ModalOtherReports,
    title: "page.purchaseReport.modal.otherReports.title",
    open: openModalOtherReport,
    setOpen: setOpenModalOtherReport,
    maxWidth: 'md',
    data: {
      listProviders,
      listStores,
      listProducts
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" className='mb-3'>
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className='mb-3'>
            <ReactTable {...table}/>
          </Colxx>
        </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsReport {...propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalOtherReports} />
    </>
  );
}
export default PurchaseReport;