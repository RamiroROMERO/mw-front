import React, { useMemo } from 'react'
import { IntlMessages } from '@/helpers/Utils';

const useTableConf = (TableData, fnEditItem, fnDeleteItem) => {

  const tableInfo = useMemo(() => {

    return {
      title: IntlMessages("page.discounts.table.title"),
      columns: [
        { text: IntlMessages("page.discounts.table.description"), dataField: "description", headerStyle: { 'width': '45%' } },
        { text: IntlMessages("page.discounts.table.amount"), dataField: "amount", headerStyle: { 'width': '30%' } },
      ],
      data: TableData,
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
    };

  }, [TableData]);

  return { tableInfo }

}

export default useTableConf