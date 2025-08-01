import React from 'react'
import { IntlMessages } from '@/helpers/Utils'
import { Button, Card, CardBody, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { useAdminDrivers } from './useAdminDrivers'
import { Checkbox } from '@/components/checkbox'
import ReactTable from '@/components/reactTable'
import Confirmation from '@/containers/ui/confirmationMsg';

const ModalAdminDrivers = ({setOpen, data}) => {
  const {setLoading, fnGetDataDrivers, dataDrivers} = data;

  const {formState, onInputChange, table, fnClearInputs, fnSave, formValidation, sendForm, openMsgDeleteDriver, setOpenMsgDeleteDriver, fnOkDeleteDriver, onResetForm} = useAdminDrivers({setLoading, fnGetDataDrivers, dataDrivers});

  const {name, code, status} = formState;

  const {nameValid, codeValid} = formValidation;

  const propsToMsgDelete = {
    open: openMsgDeleteDriver,
    setOpen: setOpenMsgDeleteDriver,
    fnOnOk: fnOkDeleteDriver,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    <>
      <ModalBody>
        <Card className="mb-3">
          <CardBody>
            <Row>
              <Colxx xxs="12" sm="6" lg="6">
                <InputField
                  name="name"
                  label='input.name'
                  value={name}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!name}
                  feedbackText={sendForm && (nameValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="4" lg="3">
                <InputField
                  name="code"
                  label='input.internalCode'
                  value={code}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!codeValid}
                  feedbackText={sendForm && (codeValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="2" lg="3">
                <Checkbox
                  onChange={onInputChange}
                  name="status"
                  value={status}
                  label="check.status"
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12" className="div-action-button-container mb-3">
                <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
        <Row>
          <Colxx xxs="12">
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

export default ModalAdminDrivers