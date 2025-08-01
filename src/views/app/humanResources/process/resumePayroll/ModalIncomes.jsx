import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import ReactTable from '@Components/reactTable'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { useModalIncomes } from './useModalIncomes'

const ModalIncomes = ({data, setOpen}) => {
  const {idPayroll, dataDetailPayroll, listTypeIncomes, setLoading, fnViewDetailPayroll} = data;

  const {formState, formValidation, sendForm, onInputChange, table, fnSave} = useModalIncomes({idPayroll, dataDetailPayroll, setLoading, setOpen, fnViewDetailPayroll, listTypeIncomes});

  const {typeId, value, hours, days, description} = formState;

  const {typeIdValid, valueValid, descriptionValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" md="7" lg="6" xxl="7">
          <ReactTable {...table}/>
        </Colxx>
        <Colxx xxs="12" md="5" lg="6" xxl="5">
          <Row>
            <Colxx xxs="12" sm="4" md="12" lg="6">
              <InputField
                name="days"
                label='input.days'
                value={days}
                onChange={onInputChange}
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" sm="4" md="12" lg="6">
              <InputField
                name="hours"
                label='input.hours'
                value={hours}
                onChange={onInputChange}
                type="text"
              />
            </Colxx>
            <Colxx xxs="12" sm="4" md="12" lg="6">
              <InputField
                name="value"
                label='input.value'
                value={value}
                onChange={onInputChange}
                type="text"
                invalid={sendForm && !!valueValid}
                feedbackText={sendForm && (valueValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="12" lg="12">
              <SearchSelect
                label='select.typeId'
                name='typeId'
                inputValue={typeId}
                options={listTypeIncomes}
                onChange={onInputChange}
                invalid={sendForm && !!typeIdValid}
                feedbackText={sendForm && (typeIdValid || null)}
              />
            </Colxx>
            <Colxx xxs="12" md="12" lg="12">
              <InputField
                name="description"
                label='input.description'
                value={description}
                onChange={onInputChange}
                type="textarea"
                invalid={sendForm && !!descriptionValid}
                feedbackText={sendForm && (descriptionValid || null)}
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnSave}>
        <i className="iconsminds-save"/> {IntlMessages("button.save")}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalIncomes