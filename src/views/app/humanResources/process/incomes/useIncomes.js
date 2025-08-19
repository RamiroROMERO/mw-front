import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import { validFloat, validInt } from '@Helpers/Utils';

export const useIncomes = ({setLoading}) => {
  const [projectId, setProjectId] = useState(0);
  const [listEmployees, setListEmployees] = useState([]);
  const [listEmployeesByProject, setListEmployeesByProject] = useState([]);
  const [listTypeIncomes, setListTypeIncomes] = useState([]);
  const [dataIncomes, setDataIncomes] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const incomesValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    description: [(val) => val !== "", "msg.required.input.description"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    typeId: 0,
    employeeId: 0,
    employeeName: '',
    value: 0,
    days: 0,
    hours: 0,
    description: ''
  }, incomesValid);

  const { id } = formState;

  const onProjectChange = e =>{
    const project = e.target.value;
    setProjectId(project);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/incomes', (resp) => {
      const incomes = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName}
        ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}` : ''
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataIncomes(incomes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnDelete = () =>{
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/incomes/${id}`, () => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();

    setLoading(true);
    request.GET('rrhh/process/projectDetail?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.employeeId,
          label: `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}`,
          projectId: item.projectId
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/payrollDayTypes', (resp) => {
      const listTypes = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          noAccount: item.noAccount
        }
      });
      setListTypeIncomes(listTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(()=>{
    const filterEmployees = listEmployees.filter(item => item.projectId === projectId);
    setListEmployeesByProject(filterEmployees);
  },[projectId]);

  const propsToDetailIncomes = {
    ...formState,
    projectId,
    listEmployeesByProject,
    listTypeIncomes,
    listProjects,
    onResetForm,
    onInputChange,
    setLoading,
    formValidation,
    isFormValid,
    setProjectId,
    onProjectChange,
    fnGetData
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  const propsToDetailTable = {
    dataIncomes,
    setBulkForm,
    setOpenMsgQuestion
  }

  return (
    {
      propsToDetailIncomes,
      propsToMsgDelete,
      propsToDetailTable
    }
  )
}
