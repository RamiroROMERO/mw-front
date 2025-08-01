/* eslint-disable react/prop-types */
import React from 'react'
import { useModalChangeSalary } from './useModalChangeSalary';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import SearchSelect from '@Components/SearchSelect/SearchSelect';

const ModalChangeSalary = ({data, setOpen}) => {
  const {listJobPositions, setLoading} = data;

  const {formState, formValidation, onInputChange, sendForm, fnSave} = useModalChangeSalary({setLoading});

  const {salary, jobPositionId} = formState;

  const {salaryValid, jobPositionIdValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12}>
          <SearchSelect
            label='page.employees.select.jobPosition'
            name="jobPositionId"
            inputValue={jobPositionId}
            options={listJobPositions}
            onChange={onInputChange}
            invalid={sendForm && !!jobPositionIdValid}
            feedbackText={sendForm && (jobPositionIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12}>
          <InputField
            name='salary'
            label='input.salary'
            value={salary}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!salaryValid}
            feedbackText={sendForm && (salaryValid || null)}
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalChangeSalary