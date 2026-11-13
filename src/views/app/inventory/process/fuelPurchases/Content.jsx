import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useFuelPurchase } from './useFuelPurchase';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import OrderDetail from './OrderDetail';
import InvoiceDetail from './InvoiceDetail';
import ModalAdminCars from './ModalAdminCars';
import ModalAdminDrivers from './ModalAdminDrivers';
import ModalViewFuelPurchases from './ModalViewFuelPurchases';
import ModalFuelPurchaseReport from './ModalFuelPurchaseReport';
import ProcessedNotice from './ProcessedNotice';

const FuelPurchases = ({ setLoading }) => {

  const { propsToControlPanel, formState, listCars, listDrivers, listStores, listProducts, listDocuments, listProviders, listPaymentTypes, listAccounts, onInputChange, onBulkForm, formValidation, sendForm, openModalAdminCars, setOpenModalAdminCars, openModalAdminDrivers, setOpenModalAdminDrivers, fnGetDataCars, fnGetDataDrivers, dataCars, dataDrivers, dataFuelPurchases, openModalFuelPurchases, setOpenModalFuelPurchases, openMsgQuestion, setOpenMsgQuestion, fnOkDeleteFuelPurchase, openMsgAccountDocument, setOpenMsgAccountDocument, fnOkAccountDocument, onResetForm, processed, openModalReport, setOpenModalReport } = useFuelPurchase({ setLoading });

  const propsToOrderDetail = {
    formState,
    listCars,
    listDrivers,
    listStores,
    listProducts,
    onInputChange,
    onBulkForm,
    formValidation,
    sendForm,
    processed
  }

  const propsToInvoiceDetail = {
    formState,
    listDocuments,
    listProviders,
    listPaymentTypes,
    listAccounts,
    onInputChange,
    onBulkForm,
    formValidation,
    sendForm,
    processed
  }

  const propsToModalAdminCars = {
    ModalContent: ModalAdminCars,
    title: "page.fuelPurchases.modal.adminCars.title",
    open: openModalAdminCars,
    setOpen: setOpenModalAdminCars,
    maxWidth: 'lg',
    data: {
      setLoading,
      fnGetDataCars,
      dataCars
    }
  }

  const propsToModalAdminDrivers = {
    ModalContent: ModalAdminDrivers,
    title: "page.fuelPurchases.modal.adminDrivers.title",
    open: openModalAdminDrivers,
    setOpen: setOpenModalAdminDrivers,
    maxWidth: 'lg',
    data: {
      setLoading,
      fnGetDataDrivers,
      dataDrivers
    }
  }

  const propsToModalViewFuelPurchases = {
    ModalContent: ModalViewFuelPurchases,
    title: "page.fuelPurchases.modal.viewFuelPurchases.title",
    open: openModalFuelPurchases,
    setOpen: setOpenModalFuelPurchases,
    maxWidth: 'lg',
    data: {
      dataFuelPurchases,
      listDocuments,
      onBulkForm
    }
  }

  const propsToModalReport = {
    ModalContent: ModalFuelPurchaseReport,
    title: "page.fuelPurchases.modal.report.title",
    open: openModalReport,
    setOpen: setOpenModalReport,
    maxWidth: "md",
    data: {}
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteFuelPurchase,
    title: "alert.question.title"
  }

  const propsToMsgAccountDocument = {
    open: openMsgAccountDocument,
    setOpen: setOpenMsgAccountDocument,
    fnOnOk: fnOkAccountDocument,
    title: "msg.question.accountDocument.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <ProcessedNotice processed={processed} pdaNumber={formState.pdaNumber} />
              <OrderDetail {...propsToOrderDetail} />
              <InvoiceDetail {...propsToInvoiceDetail} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAdminCars} />
      <Modal {...propsToModalAdminDrivers} />
      <Modal {...propsToModalViewFuelPurchases} />
      <Modal {...propsToModalReport} />
      <Confirmation {...propsToMsgDelete} />
      <Confirmation {...propsToMsgAccountDocument} />
    </>
  );
}
export default FuelPurchases;