import React,{useState, useEffect} from 'react';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

const DetailTable = ({dataCalculation, setBulkForm, setCurrentItem, setOpenMsgQuestion}) => {
  const fnEditInput = (item) =>{
    setBulkForm (item)
  }
  const fnDeleteInput =  (item) =>{
    setCurrentItem(item)
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
      // {
      //   text: IntlMessages("page.taxCalculation.table.diference"), dataField: "differValue",
      //   headerStyle:{'width' : '15%'}, classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell',
      //   type: 'number', currencySign: 'L.', decimals: 2
      // },
      {
        text: IntlMessages("page.taxCalculation.table.percentage"), dataField: "percentValue",
        headerStyle:{'width' : '15%'}, classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      // {
      //   text: IntlMessages("page.taxCalculation.table.total"), dataField: "total", headerStyle:{'width' : '20%'},
      //   type: 'number'
      // },
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
    <ReactTable   {...table} />
  )
}

export default DetailTable;