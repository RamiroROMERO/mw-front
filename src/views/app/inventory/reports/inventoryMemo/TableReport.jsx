import React, { useState } from 'react'
import ReactTable from '@/components/reactTable'
import { IntlMessages } from '@/helpers/Utils';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';

const TableReport = ({dataMovements}) => {

  const [table, setTable] = useState({
    title: IntlMessages('page.inventoryMemo.table.title'),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.documentId"),
        dataField: "documentId",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.no"),
        dataField: "no",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.origin"),
        dataField: "origin",
        headerStyle: {width: "25%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.destination"),
        dataField: "destination",
        headerStyle: {width: "25%"},
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle:{'width' : '10%'}
      }
    ],
    data: dataMovements,
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

export default TableReport