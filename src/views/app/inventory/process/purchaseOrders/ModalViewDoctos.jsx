import React, { useState } from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@/components/reactTable'
import Modal from "@/components/modal";
import ModalPassAdmin from './ModalPassAdmin'

const ModalViewDoctos = ({data, setOpen}) => {
  const {dataPurchases} = data;
  const [openModalPassAdmin, setOpenModalPassAdmin] = useState(false);

  const fnDeletePurchase = () =>{
    setOpenModalPassAdmin(true);
  }

  const [table, setTable] = useState({
    title: ' ',
    columns: [
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.date"),
        dataField: "date",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.number"),
        dataField: "numCai",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.subtotal"),
        dataField: "subtotal",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.discount"),
        dataField: "discount",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.tax"),
        dataField: "tax",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.total"),
        dataField: "total",
        headerStyle: {width: "20%"},
        style:{textAlign: 'right'}
      }
    ],
    data: dataPurchases,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeletePurchase,
      }
    ]
  });

  const propsToModalPassAdmin = {
    ModalContent: ModalPassAdmin,
    title: "page.purchaseOrders.modal.passAdmin.title",
    open: openModalPassAdmin,
    setOpen: setOpenModalPassAdmin,
    maxWidth: "md",
    data:{}
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    <Modal {...propsToModalPassAdmin}/>
    </>
  )
}

export default ModalViewDoctos