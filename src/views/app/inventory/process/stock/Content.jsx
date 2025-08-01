import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import FilterStock from './FilterStock';
import DetailStock from './DetailStock';
import { useStock } from './useStock';
import { useDetailStock } from './useDetailStock';
import TableStock from './TableStock';
import ModalStockReport from './ModalStockReport';
import ModalPrintMovement from './ModalPrintMovement';

const Stock = ({ setLoading }) => {

  const { propsToControlPanel, formState, onInputChange, listStores, listProducts, onBulkForm, openModalStockReport, setOpenModalStockReport, openModalPrintMovement, setOpenModalPrintMovement } = useStock({ setLoading });

  const { formStateDeta, onInputChangeDeta } = useDetailStock({});

  const propsToFilterStock = {
    ...formState,
    onInputChange,
    onBulkForm,
    listStores,
    listProducts
  }

  const propsToDetailStock = {
    ...formStateDeta,
    onInputChangeDeta
  }

  const propsToModalStockReport = {
    ModalContent: ModalStockReport,
    title: "page.stock.modal.stockReports.title",
    open: openModalStockReport,
    setOpen: setOpenModalStockReport,
    maxWidth: 'md',
    data: {
      listStores,
      listProducts
    }
  }

  const propsToModalPrintMovements = {
    ModalContent: ModalPrintMovement,
    title: "page.stock.modal.printMovement.title",
    open: openModalPrintMovement,
    setOpen: setOpenModalPrintMovement,
    maxWidth: 'sm',
    data: {}
  }

  return (
    <>
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
                  <DetailStock {...propsToDetailStock} />
                </Colxx>
              </Row>
              <TableStock />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalStockReport} />
      <Modal {...propsToModalPrintMovements} />
    </>
  );
}
export default Stock;