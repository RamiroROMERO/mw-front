import { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'

const ModalViewDoctos = ({data, setOpen}) => {
  const {dataPurchases} = data;
  const [table, setTable] = useState({
    title: ' ',
    columns: [
      {
        text: IntlMessages("page.purchaseOrders.modal.viewDoctos.table.type"),
        dataField: "kindText",
        headerStyle: {width: "10%"}
      },
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
    data: dataPurchases.map((item) => ({
      ...item,
      kindText: IntlMessages(item.kind === 'ticket' ? 'page.purchaseOrders.modal.viewDoctos.kind.ticket' : 'page.purchaseOrders.modal.viewDoctos.kind.purchase')
    })),
    options: {}
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

export default ModalViewDoctos