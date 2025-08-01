import React, { useState, useEffect } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import DetailSeventhDay from './DetailSeventhDay'
import DetailTable from './DetailTable'

const SeventhDay = ({ setLoading }) => {
  const [dataSeventhDay, setDataSeventhDay] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);

  const seventhDayValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    dateStart: [(val) => val !== "", "msg.required.select.dateStart"],
    dateEnd: [(val) => val !== "", "msg.required.select.dateEnd"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    dateStart: '',
    dateEnd: '',
    totalValue: 0
  }, seventhDayValid);

  const { id, date, dateStart, dateEnd, totalValue } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/payrollSevenDays', (resp) => {
      const payrolls = resp.data.map((item) => {
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataSeventhDay(payrolls);
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
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        }
      });
      employees.unshift({ value: '0', label: 'Seleccione' });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToSeventhDay = {
    date,
    dateStart,
    dateEnd,
    onResetForm,
    onInputChange,
    formValidation,
    isFormValid
  }

  const propsToDetailTable = {
    dataSeventhDay,
    listEmployees,
    setLoading
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="4">
          <DetailSeventhDay {...propsToSeventhDay} />
        </Colxx>
        <Colxx xxs="12" lg="8">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
    </>
  )
}

export default SeventhDay