import React, { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';

export const useDetailTable = ({ onBulkForm, setOpenMsgQuestion, tableData }) => {

  const fnDeleteItem = (item) => {
    onBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnEditItem = (item) => {
    onBulkForm(item);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.paymentMethods.table.title"),
    columns: [
      { text: IntlMessages("page.paymentMethods.table.name"), dataField: "name", headerStyle: { 'width': '75%' } },
      { text: IntlMessages("table.column.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '25%' } }
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'ban',
      toolTip: IntlMessages('button.disable'),
      onClick: fnDeleteItem
    }]
  });

  useEffect(() => {
    const dataTable = { ...table, data: tableData };
    setTable(dataTable);
  }, [tableData]);

  return (
    {
      table
    }
  )
}
