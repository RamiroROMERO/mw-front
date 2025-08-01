import { useMemo } from 'react'
import { IntlMessages } from "@/helpers/Utils";

const useTableConf = ({tableData, fnEditItem, fnDeleteItem}) => {

  const tableInfo = useMemo(() => {
    return {
      title: IntlMessages("page.cashBoxes.table.title"),
      columns: [
        { text: IntlMessages("page.cashBoxes.table.name"), dataField: "name", headerStyle: { 'width': '50%' } },
        { text: IntlMessages("table.column.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '25%' } },
      ],
      data: tableData,
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
    }
  }, [tableData]);

  return { tableInfo }
}

export default useTableConf;