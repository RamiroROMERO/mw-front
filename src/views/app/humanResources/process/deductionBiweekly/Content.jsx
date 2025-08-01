import React, { useState, useEffect } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { formatDate, validInt } from '@Helpers/Utils'
import DetailDeduction from './DetailDeduction'
import DetailTable from './DetailTable'

const DeductionBiweekly = ({ setLoading }) => {
  const [listEmployees, setListEmployees] = useState([]);
  const [listBiweeklies, setListBiweeklies] = useState([]);
  const [dataDeductions, setDataDeductions] = useState([]);

  const deductionValidations = {
    date: [(val) => val !== "", "msg.required.input.date"],
    biweekId: [(val) => validInt(val) > 0, "msg.required.select.noBiweekly"],
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    value: [(val) => validInt(val) > 0, "msg.required.input.value"],
    description: [(val) => val.length > 5, "msg.required.input.description"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    biweekId: 0,
    employeeId: 0,
    description: '',
    value: 0
  }, deductionValidations);

  const { id, date, biweekId, employeeId, description, value } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/biweeklyDeductions', (resp) => {
      const deductions = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName}
        ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}` : ''
        item.biweekly = item.rrhhBiweekly ? `${formatDate(item.rrhhBiweekly.dateIn)} al ${formatDate(item.rrhhBiweekly.dateOut)}` : ''
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
    request.GET('rrhh/process/employees/findSL', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/byweeklies', (resp) => {
      const biweekly = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${formatDate(item.dateIn)} al ${formatDate(item.dateOut)}`,
        }
      });
      setListBiweeklies(biweekly);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToDetailDeduction = {
    id,
    date,
    biweekId,
    employeeId,
    description,
    value,
    listEmployees,
    listBiweeklies,
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
        <Colxx xxs="12" lg="4" className="mb-3">
          <DetailDeduction {...propsToDetailDeduction} />
        </Colxx>
        <Colxx xxs="12" lg="8">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
    </>
  )
}

export default DeductionBiweekly