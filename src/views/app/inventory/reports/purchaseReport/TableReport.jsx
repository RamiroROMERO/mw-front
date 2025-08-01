import React, { useState } from 'react'
import { IntlMessages } from '@/helpers/Utils'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable'

const TableReport = ({dataPurchases}) => {

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.provider"),
        dataField: "provider",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "store",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.noPurchase"),
        dataField: "noPurchase",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("page.purchaseReport.table.column.description"),
        dataField: "description",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle:{'width' : '10%'}
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle:{'width' : '10%'},
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle:{'width' : '10%'},
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "tax",
        headerStyle:{'width' : '10%'},
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle:{'width' : '10%'}
      }
    ],
    data: dataPurchases,
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