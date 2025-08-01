import React from 'react'
import { useModalBeneficiaries } from './useModalBeneficiaries';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { IntlMessages } from '@Helpers/Utils';
import Confirmation from '@Containers/ui/confirmationMsg';
import { InputField } from '@Components/inputFields';
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from '@Components/simpleSelect';
import { Checkbox } from '@Components/checkbox';
import ReactTable from '@Components/reactTable'

const ModalBeneficiaries = ({data, setOpen}) => {
  const {employeeId, setLoading} = data;

  const {formState, formValidation, onInputChange, table, sendForm, fnSave, fnClearInputs, propsToMsgDelete} = useModalBeneficiaries({employeeId, setLoading});

  const {name, dni, phone, address, parentId, status} = formState;

  const {nameValid, dniValid, parentIdValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} sm={7} md={8}>
          <InputField
            name='name'
            label='input.name'
            value={name}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!nameValid}
            feedbackText={sendForm && (nameValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={5} md={4}>
          <InputField
            name='dni'
            label='input.dni'
            value={dni}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!dniValid}
            feedbackText={sendForm && (dniValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={4} md={4}>
          <InputField
            name='phone'
            label='input.phone'
            value={phone}
            onChange={onInputChange}
            type='text'
          />
        </Colxx>
        <Colxx xxs={12} sm={5} md={5}>
          <SimpleSelect
            name="parentId"
            label='page.employees.modal.dependents.select.relationship'
            value={parentId}
            onChange={onInputChange}
            options={[
              {id:1,name:'Hijo(a)'},
              {id:2,name:'Esposo(a)'},
              {id:3,name:'Madre'},
              {id:4,name:'Padre'},
              {id:5,name:'Hermano(a)'},
            ]}
            invalid={sendForm && !!parentIdValid}
            feedbackText={sendForm && (parentIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={3} md={3}>
          <Checkbox
            label="check.status"
            name="status"
            value={status}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12}>
          <InputField
            name='address'
            label='input.address'
            value={address}
            onChange={onInputChange}
            type='textarea'
            style={{resize:'none'}}
          />
        </Colxx>
        <Colxx xxs={12} align="right">
          <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
          <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className='mt-3'>
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

export default ModalBeneficiaries