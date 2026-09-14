import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '../pointSales/ModalVoidInvoice';
import CreditNoteForm from './CreditNoteForm';
import CreditNoteInvoicesTable from './CreditNoteInvoicesTable';
import CreditNoteProductsTable from './CreditNoteProductsTable';
import ModalAddInvoices from './ModalAddInvoices';
import ModalSeekOriginInvoice from './ModalSeekOriginInvoice';
import ModalSeekCreditNotes from './ModalSeekCreditNotes';
import ViewPdf from '@Components/ViewPDF/ViewPdf';
import { useCreditNotes } from './useCreditNotes';

const CustCreditNotes = ({ setLoading, screenControl }) => {
  const {
    formState, formValidation, onInputChange, setBulkForm, sendForm,
    listTypeDocuments, listCustomers, listAccounts,
    detail1, detail2, originInvoice,
    onMixedChange, onCustomerChange, onTypeChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginInvoice, onChangeDetail2Qty, fnDeleteDetail2Row,
    isProcessed, isVoided, isReturn,
    openModalAddInvoices, setOpenModalAddInvoices, dataCreditNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginInvoice,
    openModalSeekCreditNotes, setOpenModalSeekCreditNotes, fnViewCreditNote,
    openModalVoid, setOpenModalVoid, fnVoidCreditNote,
    openMsgProcess, setOpenMsgProcess, fnProcessCreditNote,
    openModalPrint, setOpenModalPrint, documentPathPrint,
    propsToControlPanel
  } = useCreditNotes({ setLoading, screenControl });

  const { documentCode, documentId, numberCAI } = formState;
  const disabled = isProcessed || isVoided;

  const propsToCreditNoteForm = {
    ...formState,
    listTypeDocuments,
    listCustomers,
    listAccounts,
    onInputChange,
    setBulkForm,
    onMixedChange,
    onCustomerChange,
    onTypeChange,
    formValidation,
    sendForm,
    disabled,
    isVoided
  }

  const propsToCreditNoteInvoicesTable = {
    detail1,
    discountPercent: formState.discountPercent,
    onInputChange,
    fnAddInvoices,
    onChangeDetail1Row,
    fnApplyPercentToAll,
    fnDeleteDetail1Row,
    disabled
  }

  const propsToCreditNoteProductsTable = {
    detail2,
    originInvoice,
    fnSeekOriginInvoice,
    onChangeDetail2Qty,
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
      dataPending: dataCreditNotes,
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
      dataInvoices: dataCreditNotes,
      fnSelect: fnSelectOriginInvoice
    }
  }

  const propsToModalSeekCreditNotes = {
    ModalContent: ModalSeekCreditNotes,
    title: "page.custCreditNotes.modal.search.title",
    open: openModalSeekCreditNotes,
    setOpen: setOpenModalSeekCreditNotes,
    maxWidth: 'xl',
    data: {
      dataCreditNotes,
      fnView: fnViewCreditNote
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
      fnConfirm: fnVoidCreditNote
    }
  }

  const propsToModalPrint = {
    ModalContent: ViewPdf,
    title: "page.custCreditNotes.modal.print.title",
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
    fnOnOk: fnProcessCreditNote,
    title: "msg.question.processCreditNote.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <CreditNoteForm {...propsToCreditNoteForm} />
              <Separator className="mt-2 mb-4" />
              {isReturn
                ? <CreditNoteProductsTable {...propsToCreditNoteProductsTable} />
                : <CreditNoteInvoicesTable {...propsToCreditNoteInvoicesTable} />}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAddInvoices} />
      <Modal {...propsToModalSeekOrigin} />
      <Modal {...propsToModalSeekCreditNotes} />
      <Modal {...propsToModalVoid} />
      <Modal {...propsToModalPrint} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default CustCreditNotes;
