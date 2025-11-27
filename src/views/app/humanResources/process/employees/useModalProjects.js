import React, { useState, useEffect } from 'react'
import { IntlMessages, formatDate, validFloat, validInt } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'

export const useModalProjects = ({employeeId, turnId, listProjects, setLoading, fnGetProjects, fnGetProjectEmployee}) => {
  const [nextCode, setNextCode] = useState(0);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [listProjectsCust, setListProjectsCust] = useState([]);

  const projectsValid = {
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"],
    dateIn: [(val) => val !== '', "msg.required.select.dateIn"]
  }

  const {formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm} = useForm({
    id: 0,
    customerId: 0,
    projectId: 0,
    turnId: turnId,
    employeeId: employeeId,
    codeEmployee: '',
    dateIn: '',
    dateOut: '',
    status: 1
  }, projectsValid);

  const {id, customerId, projectId, codeEmployee, dateIn, dateOut, status} = formState;

  const onCustomerChange = e => {
    const customer = e.target.value;

    const filterProjects = listProjects.filter(item => item.customerId === customer);
    setListProjectsCust(filterProjects);

    onBulkForm({ customerId: customer });
  }

  const onProjectChange = e =>{
    const project = e.target.value;

    const filterProjects = listProjects.find(item => item.id === project);

    const nextCodeP = validFloat(filterProjects.corre) + 1;
    const codeEmpl = `${filterProjects.code}-${nextCodeP}`;

    setNextCode(nextCodeP);
    onBulkForm({ projectId: project, codeEmployee: codeEmpl });
  }

  const fnEditDocto = (item)=>{
    item.dateOut = item.dateOut==="1900-01-01"?"":item.dateOut
    item.codeEmployee = item?.codeEmployee || ''
    const filterProjects = listProjects.filter(item2 => item2.customerId === item.customerId);
    setListProjectsCust(filterProjects);
    onBulkForm(item);
  }

  const fnDeleteDocto = (item)=>{
    onBulkForm({id:item.id});
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.code"),
        dataField: "codeEmployee",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customer",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("page.project.table.nameProject"),
        dataField: "nameProject",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.dateStart"),
        dataField: "dateIn",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("table.column.dateEnd"),
        dataField: "dateOut",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.dateOut));
        }
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
        onClick: fnEditDocto
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDocto,
      }
    ]
  });

  const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = ()=>{
    setLoading(true);
    request.GET(`rrhh/process/projectDetail?employeeId=${employeeId}`, (resp)=>{
      const dataProjects = resp.data.map((item)=>{
        item.customer = item?.facCliente?.name || ""
        item.nameProject = item?.rrhhProject?.name || ""
        item.statusIcon = (item.status === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: dataProjects
      }
      setTable(tableData);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = ()=>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    const newData = {
      customerId,
      projectId,
      turnId,
      employeeId,
      codeEmployee,
      dateIn,
      dateOut: dateOut===""?"1900-01-01":dateOut,
      status
    }

    if(id === 0){
      setLoading(true);
      request.POST('rrhh/process/projectDetail', newData, (resp) => {
        onInputChange({target:{name:'id', value:resp.data.id}});

        // actualizar correlativo del proyecto
        const dataUpdate = {
          corre: nextCode
        }
        setLoading(true);
        request.PUT(`rrhh/process/projects/${projectId}`, dataUpdate, () => {
          setLoading(false);
          fnGetProjects();
        }, (err) => {
          console.error(err);
          setLoading(false);
        });

        fnGetData();
        fnGetProjectEmployee(employeeId);
        fnClearInputs();
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/projectDetail/${id}`, newData, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDelete = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/projectDetail/${id}`, (resp) => {
      console.log(resp);
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(()=>{
    fnGetData();
  },[]);

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      fnClearInputs,
      fnSave,
      propsToMsgDelete,
      table,
      listProjectsCust,
      onCustomerChange,
      onProjectChange,
      onInputChange
    }
  )
}
