import React, { useState } from 'react'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable';

const ModalSummary = ({data,setOpen}) => {
  const {dataSummary} = data;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.productCode"),
        dataField: "productCode",
        headerStyle: { width: "30%" }
      },
      {
        text: IntlMessages("table.column.productName"),
        dataField: "productName",
        headerStyle: { width: "40%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle: { 'width': '10%' },
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.qty, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.subtotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.commissionValue"),
        dataField: "sellerValue",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.sellerValue, '', 2));
        }
      }
    ],
    data: dataSummary,
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

export default ModalSummary