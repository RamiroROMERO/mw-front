import React, {useState, useEffect} from 'react'
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils'
import { request } from '@Helpers/core';
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';

const DetailTable = ({id, dataDeductions, setBulkForm, onResetForm, fnGetData, setLoading}) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const fnEditDeduction = (item)=>{
    setBulkForm(item);
  }

  const fnDeleteDeduction = (item)=>{
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnDelete = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/biweeklyDeductions/${id}`, (resp) => {
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
    title: IntlMessages("page.deductions.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "20%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.biweekly"),
        dataField: "biweekly",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "45%"}
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: {width: "10%"},
        style:{textAlign: 'right'},
        cell:({row})=>{
          return (formatNumber(row.original.value,'', 2));
        }
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
        onClick: fnEditDeduction
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDeduction,
      }
    ]
  });

  useEffect(()=>{
    const dataTable = {...table, data: dataDeductions};
    setTable(dataTable);
  },[dataDeductions]);

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