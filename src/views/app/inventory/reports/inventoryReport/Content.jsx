import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import HeaderReport from './HeaderReport';
import TableReport from './TableReport';
import ModalOtherReports from './ModalOtherReports';
import { useInventoryReport } from './useInventoryReport';

const InventoryReport = ({ setLoading }) => {

  const { formState, onInputChange, listStores, listProducts, dataInventory, fnSearchReport, fnExportToExcel, fnPrintReport, fnOtherReport, openModalOtherReport, setOpenModalOtherReport } = useInventoryReport({ setLoading });

  const propsToHeaderReport = {
    ...formState,
    onInputChange,
    listProducts,
    listStores,
    fnSearchReport,
    fnExportToExcel,
    fnPrintReport,
    fnOtherReport
  }

  const propsToTable = {
    dataInventory
  }

  const propsToModalOtherReports = {
    ModalContent: ModalOtherReports,
    title: "page.inventoryReport.modal.otherReports.title",
    open: openModalOtherReport,
    setOpen: setOpenModalOtherReport,
    maxWidth: 'md',
    data: {
      listStores,
      listProducts
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <TableReport {...propsToTable} />
      <Modal {...propsToModalOtherReports} />
    </>
  );
}
export default InventoryReport;