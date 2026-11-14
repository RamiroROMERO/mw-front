import { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import Modal from "@Components/modal";
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewOrders from '../purchaseOrders/ModalViewOrders';
import { useAccountingActive } from './useAccountingActive';
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
  // Contabilidad activa (mw_setting.cont_menu): sin ella no hay almacén, cuenta, "Al Inventario" ni Contabilizar (igual que el legacy).
  const accountingActive = useAccountingActive();

  const {
    formStateDeta, onInputChangeDeta, openModalProducts, setOpenModalProducts, fnViewProducts, fnSelectProduct, fnClearProduct, onBulkFormDeta,
    sendFormDeta, setSendFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta
  } = useTicketDetail({ accountingActive });

  const {
    propsToControlPanel, formState, onInputChange, listDocuments, listProviders, listPaymentTypes, listAccounts, listStores,
    onBulkForm, sendForm, formValidation, processed, openModalViewTicket, setOpenModalViewTickets, dataOrders, dataTickets,
    openModalViewOrders, setOpenModalViewOrders, fnViewOrder, fnViewTicket, openMsgAccountDocument, setOpenMsgAccountDocument,
    fnOkAccountDocument, openMsgCancelDocument, setOpenMsgCancelDocument, fnOkCancelDocument, openModalSettings,
    setOpenModalSettings, openModalBulkLoad, setOpenModalBulkLoad, fnConfirmBulkLoad
  } = useTicketPurchase({ setLoading, setTicketDetail, ticketDetail, onResetFormDeta, accountingActive });

  const propToFormTicket = {
    ...formState,
    onInputChange,
    listDocuments,
    listProviders,
    listPaymentTypes,
    sendForm,
    formValidation,
    processed
  }

  const propsToDetailProduct = {
    ...formStateDeta,
    onInputChangeDeta,
    listAccounts,
    listStores,
    fnViewProducts,
    fnClearProduct,
    onBulkFormDeta,
    onResetFormDeta,
    onBulkForm,
    ticketDetail,
    setTicketDetail,
    sendFormDeta,
    setSendFormDeta,
    formValidationDeta,
    isFormValidDeta,
    accountingActive,
    processed
  }

  const propsToDetailTable = {
    ...formState,
    onInputChange,
    ticketDetail,
    setTicketDetail,
    onBulkForm,
    onBulkFormDeta,
    processed
  }

  // ModalViewProd pide el catálogo por páginas (con búsqueda en el servidor) y entrega la fila elegida a `fnSelectItem`.
  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
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
