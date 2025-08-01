import React, { useState } from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useForm } from '@Hooks';
import DetailInput from './DetailInput';
import DetailTable from './DetailTable';
import { request } from '@Helpers/core';

const InpuOutputs = (props) => {
  const { setLoading } = props;
  const [dataInput, setDataInput] = useState([]);

  const { formState, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    date: ''
  });
  const { date } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/proccess/attendanceControl?date=${date}`, (resp) => {
      const data = resp.data.map(item => {
        item.employeeName = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}` : ""
        return item
      });
      setDataInput(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const propsToDetailTable = {
    dataInput
  }

  const propsToDetailInput = {
    date,
    onInputChange,
    fnGetData
  }

  return (
    <>
      <Row>
        <Colxx xss="12" lg="12">
          <DetailInput {...propsToDetailInput} />
        </Colxx>
        <Colxx xss="12" lg="12">
          <DetailTable {...propsToDetailTable} />
        </Colxx>
      </Row>
    </>
  )
}

export default InpuOutputs;