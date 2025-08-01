import React, { useState, useEffect } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils'
import { request } from '@Helpers/core';
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';

const DetailTable = ({id, dataBiweeklies, setBulkForm, onResetForm, fnGetData, setLoading}) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const fnEditBiweekly = (item)=>{
    console.log(item);
    setBulkForm(item);
  }

  const fnDeleteBiweekly = (item)=>{
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnDelete = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/byweeklies/${id}`, (resp) => {
      console.log(resp);
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
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

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    <>
      <ReactTable {...table}/>
      <Confirmation {...propsToMsgDelete}/>
    </>
  )
}

export default DetailTable