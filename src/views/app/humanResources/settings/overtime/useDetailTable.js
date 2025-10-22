import React, {useState, useEffect} from 'react';
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

const useDetailTable = ({dataOvertime, onBulkForm, setOpenMsgQuestion, fnDelete}) => {

  const fnDeleteInput = (item) =>{
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true)
  }

  const fnEditInput= (item) =>{
    onBulkForm(item);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.overtime.table.title"),
    columns: [
      {
        text: IntlMessages("page.overtime.table.workingDay"), dataField: "journalIdName", headerStyle:{'width' : '30%'}
      },
      {
        text: "%", dataField: "percentValueItem", headerStyle:{'width' : '20%'}
      },
      { text: IntlMessages("page.overtime.table.hourInit"), dataField: "hourInit", headerStyle:{'width' : '20%'}
      },
      { text: IntlMessages("page.overtime.table.hourEnd"), dataField: "hourEnd", headerStyle:{'width' : '20%'}
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
    const tableData = {...table, data: dataOvertime};
    setTable(tableData);
  },[dataOvertime]);

  return (
    {
      table
    }
  )
}

export default useDetailTable