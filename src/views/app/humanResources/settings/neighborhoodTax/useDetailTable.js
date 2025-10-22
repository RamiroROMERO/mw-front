import React,{useState, useEffect} from 'react';
import { IntlMessages } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

const  useDetailTable= ({dataTax, onBulkForm, setOpenMsgQuestion, fnDelete}) => {

  const fnEditInput = (item) =>{
    onBulkForm(item)
  }
  const fnDeleteInput = (item) =>{
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true)
  }

  const [table, setTable] = useState({

    title: IntlMessages("page.neighborhoodTax.table.title"),
    columns: [
      {
        text: IntlMessages("page.neighborhoodTax.table.of"), dataField: "rangeInit", headerStyle:{'width' : '20%'},
        style:{textAlign: 'right'}, type: 'number', currencySign: 'L.', decimals: 2
      },
      {
        text: IntlMessages("page.neighborhoodTax.table.until"), dataField: "rangeEnd", headerStyle:{'width' : '20%'},
        style:{textAlign: 'right'}, type: 'number', currencySign: 'L.', decimals: 2
      },
      {
        text: IntlMessages("page.neighborhoodTax.table.range"), dataField: "range", headerStyle:{'width' : '15%'},
        style:{textAlign: 'right'}, type: 'number', currencySign: 'L.', decimals: 2
      },
      {
        text: IntlMessages("page.neighborhoodTax.table.percent"), dataField: "rate", headerStyle:{'width' : '15%'},
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell', type: 'number'
      },
      {
        text: IntlMessages("page.neighborhoodTax.table.total"), dataField: "total", headerStyle:{'width' : '20%'},
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell', type: 'number'
      },
      {
        text: IntlMessages("table.column.status"), dataField: "status", headerStyle:{'width' : '10%'},
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell', type: "boolean"
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
    const tableData = {...table, data: dataTax};
    setTable(tableData);
  },[dataTax]);

  return (
    {
      table
    }
  )
}

export default useDetailTable