import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Modal from "@Components/modal";
import ReactTable from '@Components/reactTable'
import HeaderReport from './HeaderReport';
import ModalOtherReports from './ModalOtherReports';
import { useInventoryReport } from './useInventoryReport';

const InventoryReport = ({ setLoading }) => {

  const { table, propsToHeaderReport, listStores, listDestinations, listProducts, onProductSearch, openModalOtherReport, setOpenModalOtherReport } = useInventoryReport({ setLoading });

  const propsToModalOtherReports = {
    ModalContent: ModalOtherReports,
    title: "page.inventoryReport.modal.otherReports.title",
    open: openModalOtherReport,
    setOpen: setOpenModalOtherReport,
    maxWidth: 'xl',
    data: { listStores, listDestinations, listProducts, onProductSearch, setLoading }
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
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToModalOtherReports} />
    </>
  );
}
export default InventoryReport;
