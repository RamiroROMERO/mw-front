import React, { useState } from 'react'
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';

const ModalNewCustomers = ({data,setOpen}) => {
  const {dataNewCustomers} = data;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.seller"),
        dataField: "seller",
        headerStyle: { width: "35%" },
        cell: ({row}) => {
          return `${row.original.sellerCode} | ${row.original.sellerName}`;
        }
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "15%" },
        cell: ({row}) => {
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customer",
        headerStyle: { 'width': '50%' },
        cell: ({row}) => {
          return `${row.original.customerCode} | ${row.original.customerName}`;
        }
      }
    ],
    data: dataNewCustomers,
    actions: []
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

export default ModalNewCustomers