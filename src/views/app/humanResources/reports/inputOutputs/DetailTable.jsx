import React, {useState, useEffect} from 'react'
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils'

const DetailTable = ({dataInput}) =>{

  const [table, setTable] = useState({
    title: IntlMessages("page.inputOutput.table.title"),
    columns: [
      {
        text: IntlMessages("page.inputOutput.table.employe"), dataField: "employeeName", headerStyle:{'width' : '55%'}
      },
      {
        text: IntlMessages("page.inputOutput.table.input"), dataField: "input", headerStyle:{'width' : '15'}
      },
      {
        text: IntlMessages("table.column.breakTimeOut"), dataField: "breakOut", headerStyle:{'width' : '15'}
      },
      {
        text: IntlMessages("table.column.breakTimeIn"), dataField: "breakIn", headerStyle:{'width' : '15'}
      },
      {
        text: IntlMessages("page.inputOutput.table.output"), dataField: "output", headerStyle:{'width' : '15'}
      },
    ],
    data:[],
    options: {
      columnActions: "options"
    },
    actions: []
  });

  useEffect(()=>{
    const tableData = {...table, data: dataInput};
    setTable(tableData);
  },[dataInput]);

  return (
    <ReactTable
      {...table}
    />
  )
};

export default DetailTable