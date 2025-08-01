import React, { useState } from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from '@/helpers/Utils';
import ReactTable from '@/components/reactTable'

const TableStock = () => {

  const [table, setTable] = useState({
    title: IntlMessages("page.stock.tableDetail.title"),
    columns: [
      {
        text: IntlMessages("table.column.type"),
        dataField: "type",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "9%"}
      },
      {
        text: IntlMessages("page.stock.table.column.qtyInput"),
        dataField: "qtyInput",
        headerStyle: {width: "7%"}
      },
      {
        text: IntlMessages("page.stock.table.column.valueInput"),
        dataField: "valueInput",
        headerStyle: {width: "7%"}
      },
      {
        text: IntlMessages("page.stock.table.column.qtyOutput"),
        dataField: "qtyOutput",
        headerStyle: {width: "7%"}
      },
      {
        text: IntlMessages("page.stock.table.column.valueOutput"),
        dataField: "valueOutput",
        headerStyle:{'width' : '7%'}
      },
      {
        text: IntlMessages("page.stock.table.column.unitCost"),
        dataField: "unitCost",
        headerStyle:{'width' : '7%'}
      },
      {
        text: IntlMessages("page.stock.table.column.doctoNum"),
        dataField: "doctoNum",
        headerStyle:{'width' : '10%'}
      },
      {
        text: IntlMessages("page.stock.table.column.lot"),
        dataField: "lot",
        headerStyle:{'width' : '10%'}
      },
      {
        text: IntlMessages("page.stock.table.column.expirationDate"),
        dataField: "expirationDate",
        headerStyle:{'width' : '7%'}
      },
      {
        text: IntlMessages("table.column.userName"),
        dataField: "userName",
        headerStyle:{'width' : '10%'}
      },
      {
        text: IntlMessages("table.column.provider"),
        dataField: "provider",
        headerStyle:{'width' : '10%'}
      }
    ],
    data: [],
    actions: []
  });

  return (
    <Row>
      <Colxx xxs="12">
        <ReactTable {...table}/>
      </Colxx>
    </Row>
  )
}

export default TableStock