import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import FilterStock from './FilterStock';
import DetailStock from './DetailStock';
import TableStock from './TableStock';
import ModalStockReport from './ModalStockReport';
import ModalPrintMovement from './ModalPrintMovement';
import { useStock } from './useStock';

const Stock = ({ setLoading }) => {
  const { propsToControlPanel, formState, errors, sendForm, kardex, summary, listStores, listProducts, openModalReports, setOpenModalReports, openModalMovement, setOpenModalMovement, onFilterChange, onProductChange, onProductSearch } = useStock({ setLoading });

  const propsToFilterStock = {
    ...formState,
    inputUnit: kardex.product?.inputUnit ?? '',
    outputUnit: kardex.product?.outputUnit ?? '',
    errors,
    sendForm,
    listStores,
    listProducts,
    onFilterChange,
    onProductChange,
    onProductSearch
  };

  const propsToModalReports = {
    ModalContent: ModalStockReport,
    title: 'page.stock.modal.stockReports.title',
    open: openModalReports,
    setOpen: setOpenModalReports,
    maxWidth: 'md',
    data: { listStores }
  };

  const propsToModalMovement = {
    ModalContent: ModalPrintMovement,
    title: 'page.stock.modal.printMovement.title',
    open: openModalMovement,
    setOpen: setOpenModalMovement,
    maxWidth: 'md',
    data: {}
  };

  return (
    <Row>
      <Colxx xxs="12">
        <Card>
          <CardBody>
            <ControlPanel {...propsToControlPanel} />
            <Separator className="mt-2 mb-4" />
            <Row>
              <Colxx xxs="12" sm="6" lg="8" xxl="9">
                <FilterStock {...propsToFilterStock} />
              </Colxx>
              <Colxx xxs="12" sm="6" lg="4" xxl="3">
                <DetailStock summary={summary} />
              </Colxx>
            </Row>
            <TableStock rows={kardex.rows} />
          </CardBody>
        </Card>
      </Colxx>
      <Modal {...propsToModalReports} />
      <Modal {...propsToModalMovement} />
    </Row>
  );
}
export default Stock;
