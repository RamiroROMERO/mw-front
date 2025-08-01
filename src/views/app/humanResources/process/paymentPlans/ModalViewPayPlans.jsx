import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable'

const ModalViewPayPlans = ({setOpen, data}) => {
  const {dataPaymentPlans, setBulkForm, fnViewPaymentPlans} = data;

  const fnViewDetail = (item)=>{
    fnViewPaymentPlans(item.id);
    item.employeeName = `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}`
    setBulkForm(item);
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.paymentPlans.modal.viewPaymentPlans.title"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.quota"),
        dataField: "noQuotes",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: dataPaymentPlans,
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewDetail
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

export default ModalViewPayPlans