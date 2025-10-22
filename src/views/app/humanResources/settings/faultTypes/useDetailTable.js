import React, {useState, useEffect} from 'react'
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

const useDetailTable = ({dataFaultTypes, onBulkForm, setOpenMsgQuestion, fnDelete}) =>{

  const fnEditInput = (item) =>{
    onBulkForm(item);
  }

  const fnDeleteInput = (item) =>{
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.faultTypes.table.title"),
    columns: [
      {
        text: IntlMessages("page.faultTypes.table.name"), dataField: "name", headerStyle:{'width' : '65%'}
      },
      {
        text: IntlMessages("table.column.classification"), dataField: "classificationName", headerStyle:{'width' : '25%'}
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
    const tableData = {...table, data: dataFaultTypes};
    setTable(tableData);
  },[dataFaultTypes]);


  return (
    {
      table
    }
  )
}

export default useDetailTable