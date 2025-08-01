import React, { useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Separator } from '@/components/common/CustomBootstrap';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import ModalViewProd from '../../settings/productsCatalog/ModalViewProd';
import ModalViewOrders from '../purchaseOrders/ModalViewOrders';
import { useTicketPurchase } from './useTicketPurchase';
import { useTicketDetail } from './useTicketDetail';
import DetailProduct from './DetailProduct';
import FormTicket from './FormTicket';
import DetailTable from './DetailTable';
import ModalViewTickets from './ModalViewTickets';

const TicketPurchase = ({ setLoading }) => {
  const [ticketDetail, setTicketDetail] = useState([]);

  const { formStateDeta, onInputChangeDeta, openModalProducts, setOpenModalProducts, fnViewProducts, dataProducts, onBulkFormDeta, sendFormDeta, setSendFormDeta, formValidationDeta, isFormValidDeta, onResetFormDeta } = useTicketDetail({ setLoading });

  const { propsToControlPanel, formState, onInputChange, listDocuments, listProviders, listPaymentTypes, listAccounts, listStores, onBulkForm, sendForm, formValidation, openModalViewTicket, setOpenModalViewTickets, dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewOrder } = useTicketPurchase({ setLoading, setTicketDetail, onResetFormDeta });

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
      dataProducts
    }
  }

  const propsToModalViewTickets = {
    ModalContent: ModalViewTickets,
    title: "page.ticketPurchase.modal.viewTickets.title",
    open: openModalViewTicket,
    setOpen: setOpenModalViewTickets,
    maxWidth: 'lg',
    data: {}
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
    </>
  );
}
export default TicketPurchase;