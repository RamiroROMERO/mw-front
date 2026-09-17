import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import FormCreditNotes from './FormCreditNotes';
import CreditNoteInvoicesTable from './CreditNoteInvoicesTable';
import CreditNoteProductsTable from './CreditNoteProductsTable';
import ModalUnpaidBill from './ModalUnpaidBill';
import ModalSeekOriginPurchase from './ModalSeekOriginPurchase';
import ModalSeekCreditNotesProv from './ModalSeekCreditNotesProv';
import { useCreditNotes } from './useCreditNotes';

const CreditNotesProv = ({ setLoading }) => {
  const {
    formState, formValidation, onInputChange, sendForm,
    listDocuments, listProviders, listAccounts,
    detail1, detail2, originPurchase,
    onProviderChange, onTypeChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginPurchase, onChangeDetail2Qty, fnDeleteDetail2Row,
    isVoided, isReturn, disabled,
    openModalAddInvoices, setOpenModalAddInvoices, dataCreditNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginPurchase,
    openModalSeekCreditNotes, setOpenModalSeekCreditNotes, fnViewCreditNote,
    openModalVoid, setOpenModalVoid, fnVoidCreditNote,
    openMsgProcess, setOpenMsgProcess, fnProcessCreditNote,
    propsToControlPanel
  } = useCreditNotes({ setLoading });

  const { documentCode, documentId, numberCAI, accCode } = formState;

  const propsToFormCreditNotes = {
    ...formState,
    listDocuments,
    listProviders,
    onInputChange,
    onProviderChange,
    onTypeChange,
    formValidation,
    sendForm,
    disabled,
    isVoided
  }

  const propsToCreditNoteInvoicesTable = {
    detail1,
    discountPercent: formState.discountPercent,
    accCode,
    listAccounts,
    onInputChange,
    fnAddInvoices,
    onChangeDetail1Row,
    fnApplyPercentToAll,
    fnDeleteDetail1Row,
    disabled
  }

  const propsToCreditNoteProductsTable = {
    detail2,
    originPurchase,
    fnSeekOriginPurchase,
    onChangeDetail2Qty,
    fnDeleteDetail2Row,
    disabled
  }

  const propsToModalUnpaidBill = {
    ModalContent: ModalUnpaidBill,
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
    ModalContent: ModalSeekOriginPurchase,
    title: "button.selectInvoice",
    open: openModalSeekOrigin,
    setOpen: setOpenModalSeekOrigin,
    maxWidth: 'lg',
    data: {
      dataPurchases: dataCreditNotes,
      fnSelect: fnSelectOriginPurchase
    }
  }

  const propsToModalSeekCreditNotes = {
    ModalContent: ModalSeekCreditNotesProv,
    title: "page.creditNotesProv.modal.search.title",
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
              <FormCreditNotes {...propsToFormCreditNotes} />
              <Separator className="mt-2 mb-4" />
              {isReturn
                ? <CreditNoteProductsTable {...propsToCreditNoteProductsTable} />
                : <CreditNoteInvoicesTable {...propsToCreditNoteInvoicesTable} />}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalUnpaidBill} />
      <Modal {...propsToModalSeekOrigin} />
      <Modal {...propsToModalSeekCreditNotes} />
      <Modal {...propsToModalVoid} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default CreditNotesProv;
