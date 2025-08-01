import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { IntlMessages } from '@/helpers/Utils'
import { useForm } from '@/hooks'
import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'

const ModalPassAdmin = ({setOpen}) => {
  const {formState, onInputChange, onResetForm, setBulkForm} = useForm({
    passAdmin: ''
  });

  const {passAdmin} = formState;

  const fnAcceptPass = ()=>{}

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12">
          <InputField
            name="passAdmin"
            label='page.purchaseOrders.modal.passAdmin.input.passAdmin'
            value={passAdmin}
            onChange={onInputChange}
            type="password"
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnAcceptPass}>
          <i className="bi bi-check-lg"/>{IntlMessages("button.accept")}
        </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalPassAdmin