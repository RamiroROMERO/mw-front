import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import { validFloat, validInt } from '@Helpers/Utils';
import { API_URLS } from '@/helpers/APIUrl';

export const useDeductions = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [projectId, setProjectId] = useState(0);
  const [listEmployees, setListEmployees] = useState([]);
  const [listEmployeesByProject, setListEmployeesByProject] = useState([]);
  const [listTypeDeductions, setListTypeDeductions] = useState([]);
  const [dataDeductions, setDataDeductions] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [dataDefaultDeduction, setDataDefaultDeduction] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [incWeekly, setIncWeekly] = useState(0);

  const deductionsValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    // employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
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
    description: ''
  }, deductionsValid);

  const { id, date, typeId, employeeId, employeeName, value, description } = formState;

  const onProjectChange = e => {
    const project = e.target.value;
    setProjectId(project);
  }

  const onTypeIdChange = e => {
    const type = e.target.value;

    const filter = dataDefaultDeduction.find(item => item.deductionTypeId === validInt(type));

    // calcular ihss
    const IHSS = filter?.isIhss || 0;
    let valueIHSS = 0;
    if(IHSS === 1){
      valueIHSS = (validFloat(filter.priceCeiling, 2) * (validFloat(filter.percent)/100))/2;
    }else{
      valueIHSS = 0;
    }

    // calcular rap
    const RAP = filter?.isRap || 0;
    let valueRap = 0;
    if(RAP === 1){
      valueRap = (validFloat(incWeekly) - validFloat(filter.priceCeiling)) * (validFloat(filter.percent)/100)/2;
    }

    setBulkForm({
      typeId: type,
      value: valueIHSS > 0 ? valueIHSS : valueRap
    });
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/deductions', (resp) => {
      const deductions = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName}
        ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}` : ''
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataDeductions(deductions);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGetDefaultDeductions = () => {
    setLoading(true);
    request.GET(`${API_URLS.RRHH_SET_DEDUCTIONS_DEFAULT}`, (resp) => {
      const data = resp.data;
      setDataDefaultDeduction(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const fnConfirmDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/deductions/${id}`, () => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();

    fnGetDefaultDeductions();

    setLoading(true);
    request.GET('rrhh/process/projectDetail?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.employeeId,
          label: `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}`,
          projectId: item.projectId,
          defaultSalary: validFloat(item?.rrhhEmployee?.defaultSalary) || 0
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/deductionTypes', (resp) => {
      const listTypes = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          noAccount: item.noAccount
        }
      });
      setListTypeDeductions(listTypes);
      setLoading(false);
    }, (err) => {

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

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filterEmployees = listEmployees.filter(item => item.projectId === projectId);
    setListEmployeesByProject(filterEmployees);
  }, [projectId]);

  const propsToDetailDeductions = {
    ...formState,
    projectId,
    setProjectId,
    onProjectChange,
    listEmployeesByProject,
    listTypeDeductions,
    listProjects,
    onResetForm,
    onInputChange,
    onTypeIdChange,
    setIncWeekly,
    fnGetData,
    setLoading,
    formValidation,
    isFormValid,
    fnCreate,
    fnUpdate
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  const propsToDetailTable = {
    dataDeductions,
    setBulkForm,
    fnDelete,
    setOpenMsgQuestion
  }

  return (
    {
      propsToDetailDeductions,
      propsToMsgDelete,
      propsToDetailTable
    }
  )
}
