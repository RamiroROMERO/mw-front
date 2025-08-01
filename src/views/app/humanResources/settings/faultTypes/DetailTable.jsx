import React,{useState, useEffect} from 'react'
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

const DetailTable = ({dataFaultTypes, setBulkForm, setCurrentItem, setOpenMsgQuestion}) =>{

  const fnEditInput = (item) =>{
    setBulkForm(item);
  }

  const fnDeleteInput = (item) =>{
    setCurrentItem(item)
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
    <ReactTable
      {...table}
   />
  )
}

export default DetailTable