import React, { useState } from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { formatDate } from '@Helpers/Utils'
import ReactTable from '@/components/reactTable'

const ModalViewOrders = ({data, setOpen}) => {
  const {dataOrders, fnViewOrder} = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.purchaseOrders.modal.viewOrder.table.title"),
    columns: [
      {
        text: IntlMessages("page.purchaseOrders.modal.viewOrder.table.date"),
        dataField: "date",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewOrder.table.provider"),
        dataField: "provider",
        headerStyle: {width: "70%"}
      },
      {
        text: IntlMessages("page.purchaseOrders.modal.viewOrder.table.valuetotal"),
        dataField: "total",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      }
    ],
    data: dataOrders,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewOrder
      }
    ]
  });

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
    </>
  )
}

export default ModalViewOrders