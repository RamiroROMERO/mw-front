import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '../pointSales/ModalVoidInvoice';
import ModalAddInvoices from '../custCreditNotes/ModalAddInvoices';
import ModalSeekOriginInvoice from '../custCreditNotes/ModalSeekOriginInvoice';
import ViewPdf from '@Components/ViewPDF/ViewPdf';
import DebitNoteForm from './DebitNoteForm';
import DebitNoteInvoicesTable from './DebitNoteInvoicesTable';
import DebitNoteProductsTable from './DebitNoteProductsTable';
import ModalSeekDebitNotes from './ModalSeekDebitNotes';
import { useDebitNotes } from './useDebitNotes';

const CustDebitNotes = ({ setLoading, screenControl }) => {
  const {
    formState, formValidation, onInputChange, sendForm,
    listTypeDocuments, listCustomers, listAccounts,
    detail1, detail2, originInvoice,
    onCustomerChange, onTypeChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginInvoice, onChangeDetail2Qty, onChangeDetail2Price, fnDeleteDetail2Row,
    isProcessed, isVoided, isAdjustment,
    openModalAddInvoices, setOpenModalAddInvoices, dataDebitNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginInvoice,
    openModalSeekDebitNotes, setOpenModalSeekDebitNotes, fnViewDebitNote,
    openModalVoid, setOpenModalVoid, fnVoidDebitNote,
    openMsgProcess, setOpenMsgProcess, fnProcessDebitNote,
    openModalPrint, setOpenModalPrint, documentPathPrint,
    propsToControlPanel
  } = useDebitNotes({ setLoading, screenControl });

  const { documentCode, documentId, numberCAI } = formState;
  const disabled = isProcessed || isVoided;

  const propsToDebitNoteForm = {
    ...formState,
    listTypeDocuments,
    listCustomers,
    listAccounts,
    onInputChange,
    onCustomerChange,
    onTypeChange,
    formValidation,
    sendForm,
    disabled,
    isVoided
  }

  const propsToDebitNoteInvoicesTable = {
    detail1,
    discountPercent: formState.discountPercent,
    onInputChange,
    fnAddInvoices,
    onChangeDetail1Row,
    fnApplyPercentToAll,
    fnDeleteDetail1Row,
    disabled
  }

  const propsToDebitNoteProductsTable = {
    detail2,
    originInvoice,
    fnSeekOriginInvoice,
    onChangeDetail2Qty,
    onChangeDetail2Price,
    fnDeleteDetail2Row,
    disabled
  }

  const propsToModalAddInvoices = {
    ModalContent: ModalAddInvoices,
    title: "button.addInvoice",
    open: openModalAddInvoices,
    setOpen: setOpenModalAddInvoices,
    maxWidth: 'lg',
    data: {
      dataPending: dataDebitNotes,
      fnConfirm: fnConfirmAddInvoices
    }
  }

  const propsToModalSeekOrigin = {
    ModalContent: ModalSeekOriginInvoice,
    title: "button.selectInvoice",
    open: openModalSeekOrigin,
    setOpen: setOpenModalSeekOrigin,
    maxWidth: 'lg',
    data: {
      dataInvoices: dataDebitNotes,
      fnSelect: fnSelectOriginInvoice
    }
  }

  const propsToModalSeekDebitNotes = {
    ModalContent: ModalSeekDebitNotes,
    title: "page.custDebitNotes.modal.search.title",
    open: openModalSeekDebitNotes,
    setOpen: setOpenModalSeekDebitNotes,
    maxWidth: 'xl',
    data: {
      dataDebitNotes,
      fnView: fnViewDebitNote
    }
  }

  const propsToModalVoid = {
    ModalContent: ModalVoidInvoice,
    title: "button.cancel2",
    open: openModalVoid,
    setOpen: setOpenModalVoid,
    maxWidth: 'md',
    data: {
      invoiceNumber: `${documentCode}-${documentId}`,
      numcai: numberCAI,
      fnConfirm: fnVoidDebitNote
    }
  }

  const propsToModalPrint = {
    ModalContent: ViewPdf,
    title: "page.custDebitNotes.modal.print.title",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: 'xl',
    data: {
      documentPath: documentPathPrint
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessDebitNote,
    title: "msg.question.processDebitNote.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <DebitNoteForm {...propsToDebitNoteForm} />
              <Separator className="mt-2 mb-4" />
              {isAdjustment
                ? <DebitNoteProductsTable {...propsToDebitNoteProductsTable} />
                : <DebitNoteInvoicesTable {...propsToDebitNoteInvoicesTable} />}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAddInvoices} />
      <Modal {...propsToModalSeekOrigin} />
      <Modal {...propsToModalSeekDebitNotes} />
      <Modal {...propsToModalVoid} />
      <Modal {...propsToModalPrint} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default CustDebitNotes;
