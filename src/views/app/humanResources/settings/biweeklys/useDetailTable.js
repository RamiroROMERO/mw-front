import React, { useState, useEffect } from 'react'
import { IntlMessages } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications';

export const useDetailTable = ({dataBiweeklies, setBulkForm, setOpenMsgQuestion, fnDelete}) => {

  const fnEditBiweekly = (item)=>{
    item.noYear = `${item.noYear}`
    setBulkForm(item);
  }

  const fnDeleteBiweekly = (item)=>{
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.biweeklys.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.year"),
        dataField: "noYear",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.noBiweekly"),
        dataField: "biweekly",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.dateStart"),
        dataField: "dateStart",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.dateEnd"),
        dataField: "dateEnd",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditBiweekly
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.edit"),
        onClick: fnDeleteBiweekly,
      }
    ]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataBiweeklies};
    setTable(dataTable);
  },[dataBiweeklies]);

  return (
    {
      table
    }
  )
}
