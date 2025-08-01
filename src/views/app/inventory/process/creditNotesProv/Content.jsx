import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import { useCreditNotes } from './useCreditNotes';
import FormCreditNotes from './FormCreditNotes';
import DetailTable from './DetailTable';
import ModalUnpaidBill from './ModalUnpaidBill';
import ModalViewPurchases from '../purchases/ModalViewPurchases';

const CreditNotesProv = ({ setLoading }) => {
  const [creditNotesDetail, setCreditNotesDetail] = useState([]);
  const [creditNotesDetail2, setCreditNotesDetail2] = useState([]);

  const { propsToControlPanel, formState, onInputChange, onBulkForm, listDocuments, listProviders, listAccounts, showDetail1, setShowDetail1, showDetail2, setShowDetail2, openModalUnpaidBill, setOpenModalUnpaidBill, showspecify, setShowSpecify, openModalViewCreditNotes, setOpenModalViewCreditNotes, dataCreditNotes, fnGetDataDetail, sendForm, formValidation } = useCreditNotes({ setLoading, setCreditNotesDetail, setCreditNotesDetail2 });

  const { percentDiscount, accountId, invoiceNum, subtotal, discount, tax, total } = formState;

  const propsToFormCreditNotes = {
    ...formState,
    listDocuments,
    listProviders,
    onInputChange,
    onBulkForm,
    setShowDetail1,
    setShowDetail2,
    setCreditNotesDetail,
    setCreditNotesDetail2,
    showspecify,
    setShowSpecify,
    sendForm,
    formValidation
  }

  const propsToDetailTable = {
    percentDiscount,
    accountId,
    invoiceNum,
    subtotal,
    discount,
    tax,
    total,
    creditNotesDetail,
    setCreditNotesDetail,
    creditNotesDetail2,
    setCreditNotesDetail2,
    listAccounts,
    onInputChange,
    showDetail1,
    showDetail2,
    setOpenModalUnpaidBill,
    sendForm,
    formValidation
  }

  const propsToModalUnpaidBill = {
    ModalContent: ModalUnpaidBill,
    title: "page.creditNotesProv.modal.unpaidBills.table.title",
    open: openModalUnpaidBill,
    setOpen: setOpenModalUnpaidBill,
    maxWidth: 'lg',
    data: {
    }
  }

  const propsToModalViewCreditNotes = {
    ModalContent: ModalViewPurchases,
    title: "page.creditNotesProv.modal.viewCreditNotes.table.title",
    open: openModalViewCreditNotes,
    setOpen: setOpenModalViewCreditNotes,
    maxWidth: 'lg',
    data: {
      dataPurchases: dataCreditNotes,
      setBulkForm: onBulkForm,
      fnGetDataDetail
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormCreditNotes {...propsToFormCreditNotes} />
              <DetailTable {...propsToDetailTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalUnpaidBill} />
      <Modal {...propsToModalViewCreditNotes} />
    </>
  );
}
export default CreditNotesProv;