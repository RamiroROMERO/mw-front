import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import { useSalesReport } from './useSalesReport';
import HeaderReport from './HeaderReport';
import ModalOtherReports from './ModalOtherReports';

const SalesReport = ({ setLoading }) => {

  const { formState, onInputChange, listCustomers, listBillers, listSellers, listStores, listProducts, fnPrintReport, fnOtherReport, onTypeChange, showCustomer, showBiller, showSeller, openModalOtherReports, setOpenModalOtherReports } = useSalesReport({ setLoading });

  const propsToHeaderReport = {
    formState,
    onInputChange,
    listCustomers,
    listBillers,
    listSellers,
    fnPrintReport,
    fnOtherReport,
    onTypeChange,
    showCustomer,
    showBiller,
    showSeller
  }

  const propsToModalOtherReports = {
    ModalContent: ModalOtherReports,
    title: "page.salesReport.modal.salesReport.title",
    open: openModalOtherReports,
    setOpen: setOpenModalOtherReports,
    maxWidth: 'xl',
    data: {
      listCustomers,
      listStores,
      listProducts,
      listSellers
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalOtherReports} />
    </>
  );
}
export default SalesReport;