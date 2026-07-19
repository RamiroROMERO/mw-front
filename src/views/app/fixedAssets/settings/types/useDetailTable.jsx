import { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';

export const useDetailTable = ({onBulkForm, setOpenMsgQuestion, tableData}) => {

  const fnEditDocument = (row) => {
    onBulkForm(row);
  }

  const fnDeleteDocument = (row) => {
    onBulkForm({id:row.id});
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("menu.fixedAssets.types"),
    columns: [
      { text: IntlMessages("input.code"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("input.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("check.status"), dataField: "status", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell',
        cell: ({ row }) => ((row.original.status === 1 || row.original.status === true)
          ? <i className="medium-icon bi bi-check2-square" />
          : <i className="medium-icon bi bi-square" />)
      }
    ],
    data: tableData,
    options: {
      enabledActionButtons: true
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
    const dataTable = {...table, data: tableData};
    setTable(dataTable);
  },[tableData]);

  return (
    {
      table
    }
  )
}
