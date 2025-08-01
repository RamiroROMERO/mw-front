import React, { useState, useEffect } from 'react'
import { IntlMessages, formatDate } from '@Helpers/Utils'
import { request } from '@Helpers/core';
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from '@Components/modal';
import ModalDetail from './ModalDetail';
import ModalMoveEmployees from './ModalMoveEmployees';

const DetailTable = ({id, dataProjects, listProjects, listCustomers, setBulkForm, fnGetData, onResetForm, setLoading}) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [openModalMoveEmployees, setOpenModalMoveEmployees] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [listWorkShifts, setListWorkShifts] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);

  const fnAddDetail = (item)=>{
    setCurrentItem(item);
    setOpenModalDetail(true);
  }

  const fnEditProject = (item)=>{
    setBulkForm(item)
  }

  const fnDeleteProject = (item)=>{
    setBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const fnDelete = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/projects/${id}`, (resp) => {
      console.log(resp);
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnChangeProject = ()=>{
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

  useEffect(()=>{
    setLoading(true);
    request.GET('rrhhSchedules', (resp)=>{
      const workShifts = resp.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id
        }
      });
      setListWorkShifts(workShifts);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/employees/findSL', (resp)=>{
      const employees = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
          value: item.id
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  },[]);

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  const propsToModalDetail = {
    title: 'page.projects.dialog.detail.title',
    ModalContent: ModalDetail,
    open: openModalDetail,
    setOpen: setOpenModalDetail,
    maxWidth: 'lg',
    data: {
      currentItem,
      listWorkShifts,
      listEmployees,
      setLoading,
      fnGetProjects: fnGetData
    }
  };

  const propsToModalMoveEmployees = {
    title: 'page.projects.dialog.moveEmployees.title',
    ModalContent: ModalMoveEmployees,
    open: openModalMoveEmployees,
    setOpen: setOpenModalMoveEmployees,
    maxWidth: 'lg',
    data: {
      listWorkShifts,
      listProjects,
      listCustomers,
      setLoading,
      fnGetProjects: fnGetData
    }
  };

  return (
    <>
      <ReactTable {...table}/>
      <Confirmation {...propsToMsgDelete} />
      <Modal {...propsToModalDetail}/>
      <Modal {...propsToModalMoveEmployees}/>
    </>
  )
}

export default DetailTable