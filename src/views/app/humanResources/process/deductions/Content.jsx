import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { validFloat, validInt } from '@Helpers/Utils';
import DetailDeductions from './DetailDeductions';
import DetailTable from './DetailTable';

const Deductions = ({ setLoading }) => {
  const [projectId, setProjectId] = useState(0);
  const [listEmployees, setListEmployees] = useState([]);
  const [listEmployeesByProject, setListEmployeesByProject] = useState([]);
  const [listTypeDeductions, setListTypeDeductions] = useState([]);
  const [dataDeductions, setDataDeductions] = useState([]);
  const [listProjects, setListProjects] = useState([]);

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

  const onProjectChange = e =>{
    const project = e.target.value;
    setProjectId(project);
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

  const propsToDetailDeductions = {
    id,
    date,
    typeId,
    employeeId,
    employeeName,
    value,
    description,
    projectId,
    setProjectId,
    onProjectChange,
    listEmployeesByProject,
    listTypeDeductions,
    listProjects,
    onResetForm,
    onInputChange,
    fnGetData,
    setLoading,
    formValidation,
    isFormValid
  }

  const propsToDetailTable = {
    id,
    dataDeductions,
    setBulkForm,
    onResetForm,
    fnGetData,
    setLoading
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" xxl="7" className="mb-3">
          <DetailDeductions {...propsToDetailDeductions} />
        </Colxx>
        <Colxx xxs="12" xxl="5">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
    </>
  )
}

export default Deductions