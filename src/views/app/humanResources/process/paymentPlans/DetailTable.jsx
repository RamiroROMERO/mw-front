import React, { useState, useEffect } from 'react'
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { Row } from 'reactstrap';
import ReactTable from '@Components/reactTable'

const DetailTable = ({dataPayPlanDetail}) => {

  const [table, setTable] = useState({
    title: IntlMessages("page.paymentPlans.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.quota"),
        dataField: "quota",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "35%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: {width: "30%"},
        style:{textAlign: 'right'},
        cell:({row})=>{
          return (formatNumber(row.original.value,'', 2));
        }
      },
      {
        text: IntlMessages("table.column.paid"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: []
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataPayPlanDetail};
    setTable(dataTable);
  },[dataPayPlanDetail]);

  return (
    <Row>
      <Colxx xxs="12">
        <ReactTable {...table}/>
      </Colxx>
    </Row>
  )
}

export default DetailTable