import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { useModalProjects } from './useModalProjects'

const ModalProjects = ({data, setOpen}) => {
  const {employeeId, turnId, listCustomers, listProjects, setLoading, fnGetProjects, fnGetProjectEmployee} = data;

  const {formState, formValidation, sendForm, fnClearInputs, fnSave, propsToMsgDelete, table, listProjectsCust,onCustomerChange, onProjectChange, onInputChange} = useModalProjects({employeeId, turnId, listProjects, setLoading, fnGetProjects, fnGetProjectEmployee})

  const {customerId, projectId, codeEmployee, dateIn, dateOut} = formState;

  const {customerIdValid, projectIdValid, dateInValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
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
            label='select.project'
            name='projectId'
            inputValue={projectId}
            options={listProjectsCust}
            onChange={onProjectChange}
            invalid={sendForm && !!projectIdValid}
            feedbackText={sendForm && (projectIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} md={4}>
          <InputField
            name='codeEmployee'
            label='input.code'
            value={codeEmployee}
            onChange={onInputChange}
            type='text'
            disabled
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
        <Colxx xxs={12} sm={6} md={12} align="right">
          <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
          <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className='mt-2'>
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default ModalProjects