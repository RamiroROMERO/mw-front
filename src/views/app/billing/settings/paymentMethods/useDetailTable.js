import { useEffect, useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';

export const useDetailTable = ({ fnEditItem, fnDeleteItem, tableData }) => {

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
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });

  useEffect(() => {
    setTable((prev) => ({ ...prev, data: tableData }));
  }, [tableData]);

  return { table }
}
