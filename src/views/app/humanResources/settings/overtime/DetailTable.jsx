import React, {useState, useEffect} from 'react';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

const DetailTable = ({dataOvertime, setBulkForm, setCurrentItem, setOpenMsgQuestion}) => {
  const fnDeleteInput = (item) =>{
    setCurrentItem(item)
    setOpenMsgQuestion(true)
  }

  const fnEditInput= (item) =>{
    setBulkForm(item);
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
    <ReactTable {...table} />
  )
}

export default DetailTable