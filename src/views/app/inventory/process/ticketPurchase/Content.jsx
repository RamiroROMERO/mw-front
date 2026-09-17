import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewOrders from '../purchaseOrders/ModalViewOrders';
import { useTicketPurchase } from './useTicketPurchase';
import { useTicketDetail } from './useTicketDetail';
import DetailProduct from './DetailProduct';
import FormTicket from './FormTicket';
import DetailTable from './DetailTable';
import ModalViewTickets from './ModalViewTickets';
import ModalTicketSettings from './ModalTicketSettings';
import ModalBulkLoadOptions from './ModalBulkLoadOptions';

const TicketPurchase = ({ setLoading }) => {
  const [ticketDetail, setTicketDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, openModalProducts, setOpenModalProducts, fnViewProducts, fnSelectProduct, dataProducts, onBulkFormDeta, sendFormDeta, setSendFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTicketDetail({ setLoading });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listProviders, listPaymentTypes, listAccounts, listStores,
    onBulkForm, sendForm, formValidation, openModalViewTicket, setOpenModalViewTickets, dataOrders, dataTickets,
    openModalViewOrders, setOpenModalViewOrders, fnViewOrder, fnViewTicket, openMsgAccountDocument, setOpenMsgAccountDocument,
    fnOkAccountDocument, openMsgCancelDocument, setOpenMsgCancelDocument, fnOkCancelDocument, openModalSettings,
    setOpenModalSettings, openModalBulkLoad, setOpenModalBulkLoad, fnConfirmBulkLoad
  } = useTicketPurchase({ setLoading, setTicketDetail, ticketDetail, onResetFormDeta });

  const propToFormTicket = {
    ...formState,
    onInputChange,
    listDocuments,
    listProviders,
    listPaymentTypes,
    sendForm,
    formValidation
  }

  const propsToDetailProduct = {
    ...formStateDeta,
    onInputChangeDeta,
    listAccounts,
    listStores,
    fnViewProducts,
    onBulkFormDeta,
    onBulkForm,
    ticketDetail,
    setTicketDetail,
    sendFormDeta,
    setSendFormDeta,
    formValidationDeta,
    isFormValidDeta
  }

  const propsToDetailTable = {
    ...formState,
    onInputChange,
    ticketDetail,
    setTicketDetail,
    onBulkForm,
    onBulkFormDeta,
    sendForm,
    formValidation
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

  const propsToModalViewTickets = {
    ModalContent: ModalViewTickets,
    title: "page.ticketPurchase.modal.viewTickets.title",
    open: openModalViewTicket,
    setOpen: setOpenModalViewTickets,
    maxWidth: 'lg',
    data: {
      dataTickets,
      fnViewTicket
    }
  }

  const propsToModalViewOrders = {
    ModalContent: ModalViewOrders,
    title: "page.purchaseOrders.modal.viewOrder.title",
    open: openModalViewOrders,
    setOpen: setOpenModalViewOrders,
    maxWidth: 'lg',
    data: {
      dataOrders,
      fnViewOrder
    }
  }

  const propsToModalSettings = {
    ModalContent: ModalTicketSettings,
    title: "page.ticketPurchase.modal.settings.title",
    open: openModalSettings,
    setOpen: setOpenModalSettings,
    maxWidth: 'sm',
    data: {}
  }

  const propsToModalBulkLoad = {
    ModalContent: ModalBulkLoadOptions,
    title: "page.ticketPurchase.modal.bulkLoad.title",
    open: openModalBulkLoad,
    setOpen: setOpenModalBulkLoad,
    maxWidth: 'md',
    data: {
      listStores,
      listAccounts,
      fnConfirmBulkLoad
    }
  }

  const propsToMsgAccountDocument = {
    open: openMsgAccountDocument,
    setOpen: setOpenMsgAccountDocument,
    fnOnOk: fnOkAccountDocument,
    title: "msg.question.accountDocument.title"
  }

  const propsToMsgCancelDocument = {
    open: openMsgCancelDocument,
    setOpen: setOpenMsgCancelDocument,
    fnOnOk: fnOkCancelDocument,
    title: "msg.question.cancel.document.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormTicket {...propToFormTicket} />
              <DetailProduct {...propsToDetailProduct} />
              <DetailTable {...propsToDetailTable} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalViewTickets} />
      <Modal {...propsToModalViewOrders} />
      <Modal {...propsToModalSettings} />
      <Modal {...propsToModalBulkLoad} />
      <Confirmation {...propsToMsgAccountDocument} />
      <Confirmation {...propsToMsgCancelDocument} />
    </>
  );
}
export default TicketPurchase;