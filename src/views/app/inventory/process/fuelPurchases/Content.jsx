import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useFuelPurchase } from './useFuelPurchase';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from "@/components/modal";
import OrderDetail from './OrderDetail';
import InvoiceDetail from './InvoiceDetail';
import ModalAdminCars from './ModalAdminCars';
import ModalAdminDrivers from './ModalAdminDrivers';
import ModalViewFuelPurchases from './ModalViewFuelPurchases';

const FuelPurchases = ({ setLoading }) => {

  const { propsToControlPanel, formState, listCars, listDrivers, listStores, listProducts, listDocuments, listProviders, listPaymentTypes, listAccounts, onInputChange, onBulkForm, formValidation, sendForm, openModalAdminCars, setOpenModalAdminCars, openModalAdminDrivers, setOpenModalAdminDrivers, fnGetDataCars, fnGetDataDrivers, dataCars, dataDrivers, dataFuelPurchases, openModalFuelPurchases, setOpenModalFuelPurchases, openMsgQuestion, setOpenMsgQuestion, fnOkDeleteFuelPurchase, onResetForm } = useFuelPurchase({ setLoading });

  const propsToOrderDetail = {
    formState,
    listCars,
    listDrivers,
    listStores,
    listProducts,
    onInputChange,
    onBulkForm,
    formValidation,
    sendForm
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
    sendForm
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
      onBulkForm
    }
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteFuelPurchase,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <OrderDetail {...propsToOrderDetail} />
              <InvoiceDetail {...propsToInvoiceDetail} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalAdminCars} />
      <Modal {...propsToModalAdminDrivers} />
      <Modal {...propsToModalViewFuelPurchases} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default FuelPurchases;