import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import { usePurchaseMemo } from './usePurchaseMemo';
import HeaderReport from './HeaderReport';
import TableReport from './TableReport';
import FooterReport from './FooterReport';
import ModalViewMemos from './ModalViewMemos';

const PurchaseMemo = (props) => {

  const { formState, onInputChange, fnAddToReport, fnDeleteReport, fnMarkReported, fnPrintPrevious, dataPurchases, dataMemos, openModalMemos, setOpenModalMemos } = usePurchaseMemo({});

  const propsToHeaderReport = {
    ...formState,
    onInputChange,
    fnAddToReport,
    fnDeleteReport,
    fnMarkReported,
    fnPrintPrevious,
    dataPurchases
  }

  const propsToTableReport = {
    dataPurchases
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
        <Colxx xx="12">
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
export default PurchaseMemo;