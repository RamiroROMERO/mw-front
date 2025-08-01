import React, {useState} from 'react'
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

const DetailTable = ({dataValues}) =>{

  const fnEditInput = () =>{}
  
  const fnDeleteInput = () =>{}

  const [table, setTable] = useState({

    
    title: IntlMessages("page.defaultValues.table.title"),
    columns: [
      { 
        text: IntlMessages("page.defaultValues.table.name"), dataField: "name", headerStyle:{'width' : '20%'} 
      },
      {
         text: IntlMessages("page.defaultValues.table.value"), dataField: "value", headerStyle:{'width' : '60%'}
      },
      {
         text: IntlMessages("table.column.options"), dataField: "options", headerStyle:{'width' : '20%'} 
      }
    ],
    data:dataValues,
    options: {
      ColumnAction: "optcions"
    },
    actions:[
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
  return (
   <ReactTable 
   {...table}
   />
  )
}

export default DetailTable