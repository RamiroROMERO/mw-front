import React, {useState, useEffect} from 'react'
import { IntlMessages, formatDate } from '@Helpers/Utils'

export const useDetailTable = ({dataIncomes, setBulkForm, setOpenMsgQuestion}) => {

  const fnEditIncomes = (item)=>{
    item.employeeName = `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}`
    setBulkForm(item);
  }

  const fnDeleteIncomes = (item)=>{
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.incomes.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "20%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "40%"}
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: {width: "30%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditIncomes
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteIncomes,
      }
    ]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataIncomes};
    setTable(dataTable);
  },[dataIncomes]);

  return (
    {
      table
    }
  )
}
