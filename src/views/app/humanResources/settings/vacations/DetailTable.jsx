import React, { useState, useEffect } from 'react'
import ReactTable from "@Components/reactTable"
import { IntlMessages } from '@Helpers/Utils'

const DetailTable = ({dataVacations, setBulkForm, setCurrentItem, setOpenMsgQuestion}) => {

  const fnDeleteVacation = (item) =>{
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const fnEditVacation = (item) =>{
    setBulkForm(item);
   }

  const [table, setTable] = useState({
    title: IntlMessages("page.vacations.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.description"), dataField: "name", headerStyle:{'width' : '55%'}
      },
      {
        text: IntlMessages("page.vacations.table.amountYear"), dataField: "qtyYears", headerStyle:{'width' : '15%'}
      },
      {
         text: IntlMessages("page.vacations.table.amountDay"), dataField: "qtyDays", headerStyle:{'width' : '15%'}
      },
      {
        text: IntlMessages("table.column.status"), dataField: "statusIcon", headerStyle:{'width' : '10%'}
      }
    ],
    data:[],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditVacation
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteVacation
      }
    ]
  });

  useEffect(()=>{
    const tableData = {...table, data: dataVacations};
    setTable(tableData);
  },[dataVacations]);

  return (
    <ReactTable {...table}/>
  )
}
export default DetailTable