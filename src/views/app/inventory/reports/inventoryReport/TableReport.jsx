import React, { useState } from 'react'
import { IntlMessages } from '@/helpers/Utils';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable'

const TableReport = ({dataInventory}) => {

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.documentId"),
        dataField: "documentId",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.origin"),
        dataField: "origin",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.destination"),
        dataField: "destination",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.product"),
        dataField: "product",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle:{'width' : '10%'}
      },
      {
        text: IntlMessages("table.column.cost"),
        dataField: "cost",
        headerStyle:{'width' : '10%'},
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle:{'width' : '10%'}
      }
    ],
    data: dataInventory,
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