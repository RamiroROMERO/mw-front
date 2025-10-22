import React, { useState, useEffect } from 'react'
import { IntlMessages, formatDate } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications';

export const useDetailTable = ({dataProjects, setBulkForm, enableMoveEmployees, setCurrentItem, setOpenModalDetail, setOpenMsgQuestion, setOpenModalMoveEmployees, fnDelete, fnCreate}) => {

  const fnAddDetail = (item)=>{
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem(item);
    setOpenModalDetail(true);
  }

  const fnEditProject = (item)=>{
    setBulkForm(item)
  }

  const fnDeleteProject = (item)=>{
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnChangeProject = ()=>{
    if (enableMoveEmployees === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setOpenModalMoveEmployees(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customer",
        headerStyle: {width: "35%"}
      },
      {
        text: IntlMessages("page.project.table.nameProject"),
        dataField: "name",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.dateStart"),
        dataField: "initDate",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.initDate));
        }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: {width: "10%"}
      },
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: true,
    },
    actions: [
      {
        color: "info",
        icon: "list",
        toolTip: IntlMessages("button.detail"),
        onClick: fnAddDetail,
      },
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditProject,
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.edit"),
        onClick: fnDeleteProject,
      },
      {
        color: "primary",
        icon: "arrow-left-right",
        title: IntlMessages("button.moveEmployees"),
        onClick: fnChangeProject,
        isFreeAction: true
      },
    ]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataProjects};
    setTable(dataTable);
  },[dataProjects]);

  return (
    {
      table
    }
  )
}
