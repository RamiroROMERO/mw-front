import React, { useState } from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from '@/helpers/Utils';
import ReactTable from '@/components/reactTable'

const TableReport = ({dataPurchases}) => {

  const [table, setTable] = useState({
    title: IntlMessages('page.purchaseMemo.table.title'),
    columns: [
      {
        text: IntlMessages("table.column.invoice"),
        dataField: "invoice",
        headerStyle: {width: "20%"}
      },
      {
        text: IntlMessages("table.column.provider"),
        dataField: "provider",
        headerStyle: {width: "40%"}
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "tax",
        headerStyle: {width: "10%"},
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