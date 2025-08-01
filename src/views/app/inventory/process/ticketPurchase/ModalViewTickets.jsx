import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import ReactTable from '@/components/reactTable'

const ModalViewTickets = ({setOpen}) => {

  const fnViewTicket = (item)=>{}

  const [table, setTable] = useState({
    title: IntlMessages("page.ticketPurchase.modal.viewTickets.title"),
    columns: [
      {
        text: IntlMessages("table.column.documentId"),
        dataField: "documentId",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "dateIn",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.provider"),
        dataField: "provider",
        headerStyle: {width: "50%"}
      },
      {
        text: IntlMessages("table.column.numCai"),
        dataField: "numCai",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.options"),
        dataField: "options",
        headerStyle:{'width' : '10%'}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewTicket,
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

export default ModalViewTickets