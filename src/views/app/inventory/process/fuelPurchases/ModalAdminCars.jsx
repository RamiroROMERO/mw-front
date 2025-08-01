import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Button, Card, CardBody, ModalBody, ModalFooter, Row } from 'reactstrap'
import { InputField } from '@/components/inputFields'
import { useAdminCars } from './useAdminCars'
import { RadioGroup } from '@/components/radioGroup'
import { Checkbox } from '@/components/checkbox'
import ReactTable from '@/components/reactTable'
import Confirmation from '@/containers/ui/confirmationMsg';

const ModalAdminCars = ({setOpen, data}) => {
  const {setLoading, fnGetDataCars, dataCars} = data;

  const {formState, table, onInputChange, fnClearInputs, fnSave, sendForm, formValidation, openMsgDeleteCar, setOpenMsgDeleteCar, fnOkDeleteCar, onResetForm} = useAdminCars({setLoading, fnGetDataCars, dataCars});

  const {name, code, internalCode, typeGas, status} = formState;

  const {nameValid, codeValid, internalCodeValid, typeGasValid} = formValidation;

  const propsToMsgDelete = {
    open: openMsgDeleteCar,
    setOpen: setOpenMsgDeleteCar,
    fnOnOk: fnOkDeleteCar,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    <>
      <ModalBody>
        <Card className='mb-3'>
          <CardBody>
            <Row>
              <Colxx xxs="12" sm="7" lg="5">
                <InputField
                  name="name"
                  label='input.name'
                  value={name}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!nameValid}
                  feedbackText={sendForm && (nameValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" sm="5" lg="4">
                <InputField
                  name="code"
                  label='input.plate'
                  value={code}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!codeValid}
                  feedbackText={sendForm && (codeValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xs="4" lg="3">
                <InputField
                  name="internalCode"
                  label='input.internalCode'
                  value={internalCode}
                  onChange={onInputChange}
                  type="text"
                  invalid={sendForm && !!internalCodeValid}
                  feedbackText={sendForm && (internalCodeValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xs="5" lg="4">
                <RadioGroup
                  label="page.fuelPurchases.modal.adminCars.title.fuelType"
                  name="typeGas"
                  value={typeGas}
                  onChange={onInputChange}
                  options={
                    [
                      {id:1, label:"page.fuelPurchases.radio.gasoline"},
                      {id:2, label:"page.fuelPurchases.radio.diesel"}
                    ]
                  }
                  display="flex"
                  invalid={sendForm && !!typeGasValid}
                  feedbackText={sendForm && (typeGasValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xs="3" lg="3">
                <Checkbox
                  onChange={onInputChange}
                  name="status"
                  value={status}
                  label="check.status"
                />
              </Colxx>
              <Colxx xxs="12" xs="12" lg="5" align="right" className="mb-2">
                <Button color="secondary" onClick={fnClearInputs} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
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

export default ModalAdminCars