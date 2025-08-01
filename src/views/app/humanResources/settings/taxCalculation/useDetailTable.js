import React,{useState, useEffect} from 'react';
import { IntlMessages } from '@Helpers/Utils';

const useDetailTable = ({dataCalculation, onBulkForm, setOpenMsgQuestion}) => {
  const fnEditInput = (item) =>{
    onBulkForm(item)
  }
  const fnDeleteInput =  (item) =>{
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.taxCalculation.table.title"),
    columns: [
      {
        text: IntlMessages("page.taxCalculation.table.starTingRange"), dataField: "rangeInit", type: 'number',
        headerStyle:{'width' : '20%'}, currencySign: 'L.', decimals: 2
      },
      {
        text: IntlMessages("page.taxCalculation.table.rangeEnd"), dataField: "rangeEnd", type: 'number',
        headerStyle:{'width' : '20%'}, currencySign: 'L.', decimals: 2
      },
      {
        text: IntlMessages("page.taxCalculation.table.percentage"), dataField: "percentValue",
        headerStyle:{'width' : '15%'}, classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("table.column.status"), dataField: "status", headerStyle:{'width' : '10%'}, type: "boolean"
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
    const tableData = {...table, data: dataCalculation};
    setTable(tableData);
  },[dataCalculation]);

  return (
    {
      table
    }
  )
}

export default useDetailTable;