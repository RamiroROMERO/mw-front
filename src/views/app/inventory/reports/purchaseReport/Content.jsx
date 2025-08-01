import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import HeaderReport from './HeaderReport';
import TableReport from './TableReport';
import TotalsReport from './TotalsReport';
import ModalOtherReports from './ModalOtherReports';
import { usePurchaseReport } from './usePurchaseReport';
import { useTotals } from './useTotals';

const PurchaseReport = ({ setLoading }) => {

  const { formState, onInputChange, listProviders, listStores, listProducts, dataPurchases, openModalOtherReport, setOpenModalOtherReport, fnSearchReport, fnExportToExcel, fnPrintReport, fnOtherReport } = usePurchaseReport({ setLoading });

  const { formStateTotals, onInputChangeTotals } = useTotals({});

  const propsToHeaderReport = {
    ...formState,
    onInputChange,
    listProviders,
    listStores,
    listProducts,
    fnSearchReport,
    fnExportToExcel,
    fnPrintReport,
    fnOtherReport
  }

  const propsToTableReport = {
    dataPurchases
  }

  const propsToTotals = {
    ...formStateTotals,
    onInputChangeTotals
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
      <TableReport {...propsToTableReport} />
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