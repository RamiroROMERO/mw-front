import React from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import ReactTable from '@Components/reactTable';
import useModalMoveEmployees from './useModalMoveEmployees';
import { InputField } from '@Components/inputFields';

const ModalMoveEmployees = ({data, setOpen}) => {
  const {listWorkShifts, listProjects, listCustomers, setLoading, fnGetProjects} = data;

  const {projectSourceId, formState, formValidation, sendForm, table, listProjectsCust, onInputChange, onProjectSourceChange, onCustomerChange, onProjectDestinationChange, fnMoveEmployee} = useModalMoveEmployees({setLoading, listProjects, fnGetProjects});

  const {turnId, customerId, projectId, codeEmployee, dateIn, dateOut, reason} = formState;

  const {turnIdValid, customerIdValid, projectIdValid, dateInValid, reasonValid} = formValidation;

  return (
  <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} sm={6} md={6}>
          <SearchSelect
            label='select.projectSourceId'
            name='projectSourceId'
            inputValue={projectSourceId}
            options={listProjects}
            onChange={onProjectSourceChange}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={6}>
          <SearchSelect
            label='select.customer'
            name='customerId'
            inputValue={customerId}
            options={listCustomers}
            onChange={onCustomerChange}
            invalid={sendForm && !!customerIdValid}
            feedbackText={sendForm && (customerIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={6}>
          <SearchSelect
            label='select.projectDestinationId'
            name='projectId'
            inputValue={projectId}
            options={listProjectsCust}
            onChange={onProjectDestinationChange}
            invalid={sendForm && !!projectIdValid}
            feedbackText={sendForm && (projectIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={6}>
          <InputField
            name='codeEmployee'
            label='input.code'
            value={codeEmployee}
            type='text'
            disabled
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={8}>
          <SearchSelect
            label='select.workShifts'
            name='turnId'
            inputValue={turnId}
            options={listWorkShifts}
            onChange={onInputChange}
            invalid={sendForm && !!turnIdValid}
            feedbackText={sendForm && (turnIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={4}>
          <DateCalendar
            name="dateIn"
            value={dateIn}
            label='select.dateIn'
            onChange={onInputChange}
            invalid={sendForm && !!dateInValid}
            feedbackText={sendForm && (dateInValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={4}>
          <DateCalendar
            name="dateOut"
            value={dateOut}
            label='select.dateOut'
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12}>
          <InputField
            name='reason'
            label='input.reason'
            value={reason}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!reasonValid}
            feedbackText={sendForm && (reasonValid || null)}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12}>
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnMoveEmployee}>
        <i className="iconsminds-save"/> {IntlMessages("button.save")}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
  </>
  )
}

export default ModalMoveEmployees