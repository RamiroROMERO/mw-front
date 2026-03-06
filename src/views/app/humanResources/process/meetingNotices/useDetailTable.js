import { formatDate, IntlMessages } from '@/helpers/Utils';
import { useEffect, useState } from 'react'

export const useDetailTable = ({ dataMeetings, onBulkForm, setOpenMsgQuestion, fnDelete, fnPrintPdf }) => {

  const fnEditDocument = (item) => {
    onBulkForm(item);
  }

  const fnDeleteDocument = (item) => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.humanResources.deductionDefaults"),
    columns: [
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "70%"}
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "20%"},
        cell:({row})=>{
          return (formatDate(row.original.dateMeet));
        }
      },
      {
        text: IntlMessages("check.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [{
      color: 'primary',
      onClick: fnPrintPdf,
      icon: 'printer'
    },{
      color: 'warning',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDeleteDocument,
      icon: 'trash'
    }],
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataMeetings};
    setTable(dataTable);
  },[dataMeetings]);

  return (
    {
      table
    }
  )
}
