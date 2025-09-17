import React, { useState } from 'react'
import ReactTable from '@/components/reactTable'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap';
import { Checkbox } from '@/components/checkbox';
import { useModalSummary } from './useModalSummary';

const ModalSummary = ({data,setOpen}) => {
  const {setLoading} = data;

  const {table, formState, onInputChange, fnViewReport} = useModalSummary({setLoading});

  const {cashId, cashierId, paymentTypeId} = formState;

  return (
    <>
    <ModalBody>
      <Row className='mb-3'>
        <Colxx xxs={12} md={4} lg={3}>
          <Checkbox
            label="select.cashId"
            name="cashId"
            value={cashId}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12} md={4} lg={3}>
          <Checkbox
            label="page.boxesReport.select.cashierId"
            name="cashierId"
            value={cashierId}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12} md={4} lg={3}>
          <Checkbox
            label="select.paymentMethod"
            name="paymentTypeId"
            value={paymentTypeId}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={() => { fnViewReport() }}>
            <i className='bi bi-search' /> {IntlMessages("button.viewReport")}
          </Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table} />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalSummary