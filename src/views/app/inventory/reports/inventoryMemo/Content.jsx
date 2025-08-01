import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import { useInventoryMemo } from './useInventoryMemo';
import HeaderReport from './HeaderReport';
import TableReport from './TableReport';
import FooterReport from '../purchaseMemo/FooterReport';
import ModalViewMemos from '../purchaseMemo/ModalViewMemos';

const InventoryMemo = (props) => {

  const { formState, onInputChange, fnMarkReported, fnPrintPrevious, dataMovements, dataMemos, openModalMemos, setOpenModalMemos } = useInventoryMemo({});

  const propsToHeaderReport = {
    formState,
    onInputChange,
    fnMarkReported,
    fnPrintPrevious
  }

  const propsToTableReport = {
    dataMovements
  }

  const propsToFooterReport = {
    formState,
    onInputChange
  }

  const propsToModalViewMemos = {
    ModalContent: ModalViewMemos,
    title: "page.purchaseMemo.modal.viewMemos.title",
    open: openModalMemos,
    setOpen: setOpenModalMemos,
    maxWidth: "lg",
    data: {
      dataMemos
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
      <TableReport {...propsToTableReport} />
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <FooterReport {...propsToFooterReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewMemos} />
    </>
  );
}
export default InventoryMemo;