import React, { useMemo } from 'react'
import { IntlMessages } from '@Helpers/Utils';

const useTableConf = (tableData, fnViewDocument) => {

  const tableInfo = useMemo(() => {

    return {
      title: IntlMessages("page.billingAreas.table.title"),
      columns: [
        { text: IntlMessages("page.billingAreas.table.name"), dataField: "name", headerStyle: { 'width': '55%' } },
        { text: IntlMessages("page.billingAreas.table.active"), dataField: "status", type: 'boolean', headerStyle: { 'width': '20%' } },
      ],
      data: tableData,
      actions: [{
        color: 'primary',
        icon: 'eye',
        toolTip: IntlMessages('button.view'),
        onClick: fnViewDocument
      }],
      options: {
        enabledRowSelection: false
      }
    };

  }, [tableData]);

  return { tableInfo }

}

export default useTableConf