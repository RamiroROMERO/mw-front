import React,{useState, useEffect} from 'react';
import { IntlMessages } from '@Helpers/Utils';

const useDetailTable = ({dataJobPosition, onBulkForm, setOpenMsgQuestion}) =>{

  const fnDeleteInput = (item) =>{
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnEditInput = (item) =>{
    onBulkForm(item)
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.jobPositions.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.name"), dataField: "name", headerStyle:{'width' : '50%'}
      },{
        text: IntlMessages("page.jobPositions.select.level"), dataField: "levelName", headerStyle:{'width' : '40%'}
      },{
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
        onClick: fnEditInput,
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteInput,
      }
    ]
  });

  useEffect(()=>{
    const tableData = {...table, data: dataJobPosition};
    setTable(tableData);
  },[dataJobPosition]);

  return (
    {
      table
    }
  )
}

export default useDetailTable;