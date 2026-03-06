import { IntlMessages } from '@/helpers/Utils';
import React, { useEffect, useState } from 'react'

export const useDetailTable = ({ data, onBulkForm, setOpenMsgQuestion, fnDelete }) => {

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
      { text: IntlMessages("table.column.deductionType"), dataField: "deductionType", headerStyle: { 'width': '40%' } },
      { text: IntlMessages("table.column.project"), dataField: "projectName", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.priceCeiling"), dataField: "priceCeiling", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.percent"), dataField: "percent", headerStyle: { 'width': '15%' } },
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
    const dataTable = {...table, data};
    setTable(dataTable);
  },[data]);

  return (
    {
      table
    }
  )
}
