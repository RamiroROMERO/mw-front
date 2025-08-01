import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import { InputField } from '@/components/inputFields'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import DateCalendar from '@/components/dateCalendar'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { useNewEvent } from './useNewEvent'

const ModalEvents = ({data, setOpen}) => {
  const {setLoading, idPatientFile, codeFile, dni, namePatient, listAreas, listDoctors, fnGetEvents, listPatients=[], typeEvent=1, currentItem={}} = data;

  const {idEvent, codeFilePhysic, formState, formValidation, sendForm, onInputChange, fnSaveDocument, fnPrintDocument, onPatientChange} = useNewEvent({IntlMessages, idPatientFile, setLoading, fnGetEvents, setOpen, currentItem, listPatients, codeFile});

  const {id, fatherId, date, areaId, specialistId1, responsibleName, responsiblePhone, notes} = formState;

  const {dateValid, specialistId1Valid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} sm={9} lg={10}>
          <ContainerWithLabel label="label.title.patient">
            <Row>
              <Colxx xxs={12} xs={5} md={4} xl={3}>
                <InputField
                  name="codeFilePhysic"
                  label="input.codePhysic"
                  value={codeFilePhysic}
                  disabled
                />
              </Colxx>
              <Colxx xxs={12} xs={7} md={8} xl={3} style={{display:typeEvent===2?'none':'block'}}>
                <InputField
                  name="dni"
                  label="input.dni"
                  value={dni}
                  disabled
                />
              </Colxx>
              <Colxx xxs={12} xs={12} md={12} xl={6} style={{display:typeEvent===2?'none':'block'}}>
                <InputField
                  name="namePatient"
                  label="input.name"
                  value={namePatient}
                  disabled
                />
              </Colxx>
              <Colxx xxs={12} style={{display:typeEvent===1?'none':'block'}}>
                <SearchSelect
                  name="fatherId"
                  inputValue={fatherId}
                  onChange={onPatientChange}
                  options={listPatients}
                  label="input.name"
                  isDisabled={currentItem.id?true:false}
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs={12} sm={3} lg={2}>
          <Row>
            <Colxx xxs={12}>
              <InputField
                name="id"
                label="input.noEvent"
                value={id}
                disabled
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs={12}>
          <ContainerWithLabel label="label.title.newEvent">
            <Row>
              <Colxx xxs={12} xs={6} xl={4}>
                <DateCalendar
                  name="date"
                  value={date}
                  label='input.date'
                  onChange={onInputChange}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && (dateValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xss={12} sm={6}>
                <SearchSelect
                  name="areaId"
                  inputValue={areaId}
                  onChange={onInputChange}
                  options={listAreas}
                  label="select.hallId"
                />
              </Colxx>
              <Colxx xss={12} sm={6}>
                <SearchSelect
                  name="specialistId1"
                  inputValue={specialistId1}
                  onChange={onInputChange}
                  options={listDoctors}
                  label="select.doctorId"
                  invalid={sendForm && !!specialistId1Valid}
                  feedbackText={sendForm && (specialistId1Valid || null)}
                />
              </Colxx>
              <Colxx xxs={12} xs={7} md={7}>
                <InputField
                  name="responsibleName"
                  label="input.responsibleName"
                  onChange={onInputChange}
                  value={responsibleName}
                />
              </Colxx>
              <Colxx xxs={12} xs={5} md={5}>
                <InputField
                  name="responsiblePhone"
                  label="input.phone"
                  onChange={onInputChange}
                  value={responsiblePhone}
                />
              </Colxx>
              <Colxx xxs={12}>
                <InputField
                  name="notes"
                  label="input.notes"
                  onChange={onInputChange}
                  value={notes}
                  type="textarea"
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="info" onClick={fnPrintDocument} disabled={idEvent===0?true:false}>
        <i className="iconsminds-printer"/>{IntlMessages("button.print")}
      </Button>
      <Button color="primary" onClick={fnSaveDocument}>
        <i className="iconsminds-save"/>{IntlMessages("button.save")}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>{` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalEvents