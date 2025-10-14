import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { SimpleSelect } from '@/components/simpleSelect';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useModalNewCustomer } from './useModalNewCustomer';
import { IntlMessagesFn } from '@/helpers/Utils';

export const ModalNewCustomer = ({ data, setOpen }) => {

  const { setLoading, setCustomer } = data;

  const { formState, formValidation, listCustomerTypes, onInputChange, sendForm, fnSaveCustomer } = useModalNewCustomer({ setLoading, setCustomer, setOpen })

  const { customerTypeId, customerCode, customerName, phone, email, address } = formState;

  const { customerTypeIdValid, customerCodeValid, customerNameValid } = formValidation;


  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <SimpleSelect
              label="page.customers.modal.modalNew.select.typeCustomer"
              name="customerTypeId"
              value={customerTypeId}
              onChange={onInputChange}
              options={listCustomerTypes}
              invalid={sendForm && !!customerTypeIdValid}
              feedbackText={sendForm && (customerTypeIdValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <InputField
              value={customerCode}
              name="customerCode"
              onChange={onInputChange}
              type="text"
              label="page.customers.modal.modalNew.input.dni"
              invalid={sendForm && !!customerCodeValid}
              feedbackText={sendForm && (customerCodeValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={customerName}
              name="customerName"
              onChange={onInputChange}
              type="text"
              label="page.customers.modal.modalNew.input.name"
              invalid={sendForm && !!customerNameValid}
              feedbackText={sendForm && (customerNameValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={phone}
              name="phone"
              onChange={onInputChange}
              type="text"
              label="page.providers.input.phone"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={email}
              name="email"
              onChange={onInputChange}
              type="email"
              label="page.providers.input.email"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={address}
              name="address"
              onChange={onInputChange}
              type="textarea"
              label="page.providers.input.address"
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color='success' onClick={fnSaveCustomer} > <i className='bi bi-floppy' /> {IntlMessagesFn("button.save")}</Button>
      </ModalFooter>
    </>
  )
}
