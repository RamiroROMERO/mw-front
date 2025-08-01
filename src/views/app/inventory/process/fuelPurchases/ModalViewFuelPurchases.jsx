import React, {useState} from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import ReactTable from '@/components/reactTable'

const ModalViewFuelPurchases = ({setOpen, data}) => {
  const {dataFuelPurchases, onBulkForm} = data;

  const fnViewPurchase = (item)=>{
    item.plate = item.gasMachine?item.gasMachine.code:''
    onBulkForm(item);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "orderNumber",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.noInvoice"),
        dataField: "invoiceCode",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.fuelPurchases.modal.viewFuelPurchases.table.driver"),
        dataField: "driver",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "valueTotal",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'}
      }
    ],
    data: dataFuelPurchases,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewPurchase,
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

export default ModalViewFuelPurchases