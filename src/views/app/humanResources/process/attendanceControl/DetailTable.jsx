import React, {useState, useEffect} from 'react'
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils'

const DetailTable = ({dataAttendance}) => {

  const [table, setTable] = useState({
    title: IntlMessages("page.inputOutput.table.title"),
    columns: [
      {
        text: IntlMessages("page.inputOutput.table.id"), dataField: "employeeId", headerStyle:{'width' : '10%'}
      },
      {
        text: IntlMessages("page.inputOutput.table.employe"), dataField: "employeeName", headerStyle:{'width' : '45%'}
      },
      {
        text: IntlMessages("page.inputOutput.table.date"), dataField: "date", headerStyle:{'width' : '15%'}
      },
      {
        text: IntlMessages("page.inputOutput.table.input"), dataField: "input", headerStyle:{'width' : '15'}
      },
      {
        text: IntlMessages("page.inputOutput.table.output"), dataField: "output", headerStyle:{'width' : '15'}
      }
    ],
    data:[],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
  });

  useEffect(()=>{
    const tableData = {...table, data: dataAttendance};
    setTable(tableData);
  },[dataAttendance]);

  return (
    <ReactTable {...table}/>
  )
}

export default DetailTable