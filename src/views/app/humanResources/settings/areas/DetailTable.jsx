import React, {useState, useEffect} from 'react'
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils'

const DetailTable = ({dataAreas, setBulkForm, setCurrentItem, setOpenMsgQuestion}) =>{

  const fnEditInput = (item) =>{
    setBulkForm(item);
  }
  const fnDeleteInput = (item) =>{
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.areas.table.title"),
    columns: [
      {
        text: IntlMessages("page.areas.table.name"), dataField: "name", headerStyle:{'width' : '50%'}
      },
      {
        text: IntlMessages("page.areas.table.chief"), dataField: "bossId", headerStyle:{'width' : '40'}
      },
      {
        text: IntlMessages("table.column.status"), dataField: "statusIcon", headerStyle:{'width' : '10'}
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
    const tableData = {...table, data: dataAreas};
    setTable(tableData);
  },[dataAreas]);

  return (
    <ReactTable
      {...table}
    />
  )
};

export default DetailTable