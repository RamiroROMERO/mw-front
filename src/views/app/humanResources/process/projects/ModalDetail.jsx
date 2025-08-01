import React from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { useModalDetail } from './useModalDetail';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { InputField } from '@Components/inputFields';

const ModalDetail = ({data, setOpen}) => {
  const {currentItem, listWorkShifts, listEmployees, setLoading, fnGetProjects} = data;

  const {codeEmployee, formState, formValidation, sendForm, onInputChange, table, propsToMsgDelete, fnSave, fnClearInputs} = useModalDetail({currentItem, setLoading, fnGetProjects});

  const {turnId, employeeId, dateIn, dateOut} = formState;

  const {turnIdValid, employeeIdValid, dateInValid} = formValidation;

  return (
  <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} sm={6} md={4}>
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
        <Colxx xxs={12} sm={6} md={8}>
          <SearchSelect
            label='select.employee'
            name='employeeId'
            inputValue={employeeId}
            options={listEmployees}
            onChange={onInputChange}
            invalid={sendForm && !!employeeIdValid}
            feedbackText={sendForm && (employeeIdValid || null)}
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
        <Colxx xxs={12} sm={6} md={8} align="right">
          <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
          <Button color="primary" onClick={fnSave}>
            <i className="iconsminds-save"/> {IntlMessages("button.save")}
          </Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12}>
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    <Confirmation {...propsToMsgDelete}/>
  </>
  )
}

export default ModalDetail