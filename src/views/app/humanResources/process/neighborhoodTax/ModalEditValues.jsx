/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { request } from '@Helpers/core';
import { formatDate, IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';

const ModalEditValues = ({data, setOpen}) => {
  const {dateStart, dateEnd, currentItemDeta, setLoading, fnViewDetailPayroll} = data;

  const [totalPayment, setTotalPayment] = useState(currentItemDeta.totalPayment);

  const onInputChange = e => {
    const value = e.target.value;
    setTotalPayment(value);
  }

  const fnSave = () => {
    const newData = {
      totalPayment
    }

    setLoading(true);
    request.PUT(`rrhh/process/weeklyPayrollDetails/${currentItemDeta.id}`, newData, () => {
      fnViewDetailPayroll(currentItemDeta.fatherId);
      setOpen(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" sm="6" lg="3" xl="3">
          <InputField
            label='select.dateStart'
            name='dateStart'
            value={formatDate(dateStart)}
            disabled
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="3" xl="3">
          <InputField
            label='select.dateEnd'
            name='dateEnd'
            value={formatDate(dateEnd)}
            disabled
          />
        </Colxx>
        <Colxx xxs="12" sm="12" lg="6" xl="6">
          <InputField
            label='select.employee'
            name='employeeId'
            value={currentItemDeta.employee}
            disabled
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="6" xl="4">
          <InputField
            label='select.jobPosition'
            name="jobPositionId"
            value={currentItemDeta.jobPosition}
            disabled
          />
        </Colxx>
        <Colxx xxs="12" sm="6" md="12" lg="6" xxl="12">
          <InputField
            name="totalPayment"
            label='input.totalPayment'
            value={totalPayment}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnSave}>
        <i className="iconsminds-save"/> {IntlMessages("button.save")}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalEditValues