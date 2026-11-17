import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useRequisitions } from './useRequisitions';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalVoidInvoice from '@Views/app/billing/process/pointSales/ModalVoidInvoice';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import { useTransfersDeta } from '../transactions/shared/useTransfersDeta';
import FormRequisitions from './FormRequisitions';
import DetailProduct from '../transactions/shared/DetailProduct';
import DetailTable from '../transactions/shared/DetailTable';
import ModalViewTransfers from '../transactions/shared/ModalViewTransfers';
import FooterTransfers from '../transactions/shared/FooterTransfers';
import ModalAddManyProducts from '../transactions/shared/ModalAddManyProducts';
import { ensureSelectedEmployee } from './requisitionRules';

const Requisitions = ({ setLoading }) => {
  const [requisitionDetail, setRequisitionDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, fnViewProducts, fnSelectProduct, openModalProducts, setOpenModalProducts, dataProducts, setBulkFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTransfersDeta({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listStores, listDestinations, sendFormDeta, setSendFormDeta,
    formValidation, sendForm, setSendForm, isFormValid, dataRequisitions, openModalViewRequisitions, setOpenModalViewRequisitions,
    onBulkForm, listAccounts, fnGetDataDetail, openMsgDeleteDocument, setOpenMsgDeleteDocument, fnOkDeleteDocument,
    disabled, isProcessed, isVoided, openMsgProcess, setOpenMsgProcess, fnProcessRequisition,
    openModalVoid, setOpenModalVoid, fnVoidRequisition, openModalAddMany, setOpenModalAddMany, fnAddManyLine,
    employees, onEmployeeSearch
  } = useRequisitions({ setLoading, requisitionDetail, setRequisitionDetail, onResetFormDeta });

  // El empleado elegido sigue en las opciones aunque la búsqueda del servidor ya no lo traiga.
  const employeesForDetail = employees ? ensureSelectedEmployee(employees, formStateDeta.employeeId, formStateDeta.employeeName) : null;

  const { notes, senderName, receiverName, sourceStoreId, assignStoreId, originCtaCode, assignCtaCode, documentCode, documentId, pdaNumber } = formState;

  const propsToFormRequisitions = {
    ...formState,
    senderName,
    receiverName,
    onInputChange,
    listDocuments,
    listStores,
    listDestinations,
    formValidation,
    sendForm,
    listAccounts,
    onBulkForm,
    disabled,
    isProcessed,
    isVoided,
    pdaNumber
  }

  const propsToDetailProduct = {
    ...formStateDeta,
    sourceStoreId,
    assignStoreId,
    originCtaCode,
    assignCtaCode,
    onInputChangeDeta,
    fnViewProducts,
    setBulkFormDeta,
    transferDetail: requisitionDetail,
    setTransferDetail: setRequisitionDetail,
    sendFormDeta,
    setSendFormDeta,
    isFormValidDeta,
    formValidationDeta,
    setSendForm,
    isFormValid,
    disabled,
    employees: employeesForDetail,
    onEmployeeSearch
  }

  const propsToDetailTable = {
    transferDetail: requisitionDetail,
    setTransferDetail: setRequisitionDetail,
    setBulkFormDeta,
    disabled,
    showEmployee: Array.isArray(employees)
  }

  const propsToFooter = {
    notes,
    onInputChange,
    disabled
  }

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts,
      fnSelectItem: fnSelectProduct
    }
  }

  const propsToModalViewRequisitions = {
    ModalContent: ModalViewTransfers,
    title: "page.requisitions.modal.viewTransfers.title",
    open: openModalViewRequisitions,
    setOpen: setOpenModalViewRequisitions,
    maxWidth: "lg",
    data: {
      dataTransfers: dataRequisitions,
      onBulkForm,
      fnGetDataDetail
    }
  }

  const propsToModalAddMany = {
    ModalContent: ModalAddManyProducts,
    title: "page.transfersToStores.button.addMany",
    open: openModalAddMany,
    setOpen: setOpenModalAddMany,
    maxWidth: 'lg',
    data: {
      url: 'inventory/process/requisitions/availableProducts',
      storeId: sourceStoreId,
      employees,
      onEmployeeSearch,
      fnAddLine: fnAddManyLine
    }
  }

  const propsToMsgDeleteDocument = {
    open: openMsgDeleteDocument,
    setOpen: setOpenMsgDeleteDocument,
    fnOnOk: fnOkDeleteDocument,
    title: "alert.question.title"
  }

  const propsToModalVoid = {
    ModalContent: ModalVoidInvoice,
    title: "button.cancel2",
    open: openModalVoid,
    setOpen: setOpenModalVoid,
    maxWidth: 'md',
    data: {
      invoiceNumber: `${documentCode}-${documentId}`,
      fnConfirm: fnVoidRequisition
    }
  }

  const propsToMsgProcess = {
    open: openMsgProcess,
    setOpen: setOpenMsgProcess,
    fnOnOk: fnProcessRequisition,
    title: "msg.question.processRequisition.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormRequisitions {...propsToFormRequisitions} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
              <FooterTransfers {...propsToFooter} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewRequisitions} />
      <Modal {...propsToModalVoid} />
      <Modal {...propsToModalAddMany} />
      <Confirmation {...propsToMsgDeleteDocument} />
      <Confirmation {...propsToMsgProcess} />
    </>
  );
}
export default Requisitions;