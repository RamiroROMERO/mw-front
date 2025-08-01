import { IntlMessages } from '@Helpers/Utils';
import React, { useEffect, useState } from 'react'

export const useDetailTable = ({onBulkForm, setOpenMsgQuestion, tableData}) => {

  const fnEditItem = (item) => {
    onBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.taxDocuement.table.title"),
    columns: [
      { text: IntlMessages("page.taxDocuement.table.name"), dataField: "name", headerStyle: { 'width': '70%' } },
      {
        text: IntlMessages("check.status"), dataField: "status", headerStyle: { 'width': '30%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell',
        cell: ({ row }) => ((row.original.status === 1 || row.original.status === true)
          ? <i className="medium-icon bi bi-check2-square" />
          : <i className="medium-icon bi bi-square" />)
      }
    ],
    data: [],
    actions: [{
      color: 'warning',
      onClick: fnEditItem,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDeleteItem,
      icon: 'trash'
    }],
  });

  useEffect(()=>{
    const dataTable = {...table, data: tableData};
    setTable(dataTable);
  },[tableData]);

  return (
    {
      table
    }
  )
}
