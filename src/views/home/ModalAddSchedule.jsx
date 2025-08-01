import React from 'react'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { useModalAddSchedule } from './useModalAddSchedule'
import { SimpleSelect } from '@Components/simpleSelect'
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg'

const ModalAddSchedule = ({data, setOpen}) => {
  const {projectId, listTurns, currentItem, setLoading, fnGetData} = data;

  const {table, formState, formValidation, sendForm, propsToMsgConfirm, onInputChange, fnSave, fnConfirmGenerateDetail} = useModalAddSchedule({projectId, currentItem, setLoading, fnGetData, setOpen});

  const {id, turnId, dateStart, dateEnd, typeId} = formState;

  const {turnIdValid, dateStartValid, dateEndValid, typeIdValid} = formValidation;

  return (
    <>
    <ModalBody style={{height: id>0? "auto": "280px"}}>
      <Row>
        <Colxx xxs={12} sm={6} lg={6}>
          <SearchSelect
            label='select.workShifts'
            name='turnId'
            inputValue={turnId}
            options={listTurns}
            onChange={onInputChange}
            invalid={sendForm && !!turnIdValid}
            feedbackText={sendForm && (turnIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={3}>
          <DateCalendar
            name="dateStart"
            value={dateStart}
            label='select.dateStart'
            onChange={onInputChange}
            invalid={sendForm && !!dateStartValid}
            feedbackText={sendForm && (dateStartValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={3}>
          <DateCalendar
            name="dateEnd"
            value={dateEnd}
            label='select.dateEnd'
            onChange={onInputChange}
            invalid={sendForm && !!dateEndValid}
            feedbackText={sendForm && (dateEndValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={4}>
          <SimpleSelect
            name="typeId"
            label='select.type'
            value={typeId}
            onChange={onInputChange}
            options={[
              {id:1,name:'Dias Laborables'},
              {id:2,name:'Dias Libres'}
            ]}
            invalid={sendForm && !!typeIdValid}
            feedbackText={sendForm && (typeIdValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} sm={6} lg={6} style={{display: (id>0 && table.data.length === 0)?"block":"none"}}>
          <Button color="info" onClick={fnConfirmGenerateDetail}>
            <i className="bi bi-arrow-clockwise" /> {IntlMessages("button.generateDetail")}
          </Button>
        </Colxx>
      </Row>
      <Row style={{display: id>0?"flex":"none"}}>
        <Colxx xxs={12}>
          <ReactTable {...table}/>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnSave} disabled={table.data.length > 0? true : false}>
        <i className="iconsminds-save"/> {IntlMessages("button.save")}
      </Button>
    </ModalFooter>
    <Confirmation {...propsToMsgConfirm}/>
    </>
  )
}

export default ModalAddSchedule