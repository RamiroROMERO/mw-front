import React,{useState, useEffect} from 'react';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

const DetailTable =({dataSchedules, setBulkForm, setCurrentItem, setOpenMsgQuestion}) => {

  const fnDeleteInput = (item) =>{
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const fnEditInput = (item) =>{
    item.d1HourIn = item.d1HourIn === "00:00:00"?'':item.d1HourIn
    item.d2HourIn = item.d2HourIn === "00:00:00"?'':item.d2HourIn
    item.d3HourIn = item.d3HourIn === "00:00:00"?'':item.d3HourIn
    item.d4HourIn = item.d4HourIn === "00:00:00"?'':item.d4HourIn
    item.d5HourIn = item.d5HourIn === "00:00:00"?'':item.d5HourIn
    item.d6HourIn = item.d6HourIn === "00:00:00"?'':item.d6HourIn
    item.d7HourIn = item.d7HourIn === "00:00:00"?'':item.d7HourIn
    item.d1HourOut = item.d1HourOut === "00:00:00"?'':item.d1HourOut
    item.d2HourOut = item.d2HourOut === "00:00:00"?'':item.d2HourOut
    item.d3HourOut = item.d3HourOut === "00:00:00"?'':item.d3HourOut
    item.d4HourOut = item.d4HourOut === "00:00:00"?'':item.d4HourOut
    item.d5HourOut = item.d5HourOut === "00:00:00"?'':item.d5HourOut
    item.d6HourOut = item.d6HourOut === "00:00:00"?'':item.d6HourOut
    item.d7HourOut = item.d7HourOut === "00:00:00"?'':item.d7HourOut
    setBulkForm(item)
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.schedules.table.title"),
    columns: [
      { text: IntlMessages("page.schedules.table.name"), dataField: "name", headerStyle:{'width' : '90%'} },
      { text: IntlMessages("table.column.status"), dataField: "statusIcon", headerStyle:{'width' : '10%'} }
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
        onClick: fnEditInput
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteInput
      }
    ]
  });

  useEffect(()=>{
    const tableData = {...table, data: dataSchedules};
    setTable(tableData);
  },[dataSchedules]);

  return (
    <ReactTable 
      {...table}
    />
  )
}

export default DetailTable;