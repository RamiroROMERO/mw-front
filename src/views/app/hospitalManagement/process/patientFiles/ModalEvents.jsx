import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { RadioGroup } from '@Components/radioGroup'
import { useNewEvent } from './useNewEvent'

const ModalEvents = ({data, setOpen}) => {
  const {setLoading, idPatientFile, codeFile, dni, namePatient, listAreas, listDoctors, fnGetEvents, listPatients=[], typeEvent=1, currentItem={}} = data;

  const {idEvent, codeFilePhysic, formState, formValidation, sendForm, insuranceOptions, onInputChange, fnSaveDocument, fnPrintDocument, onPatientChange} = useNewEvent({IntlMessages, idPatientFile, setLoading, fnGetEvents, setOpen, currentItem, listPatients, codeFile});

  const {id, fatherId, date, areaId, attendingSpecialistId, responsibleName, responsiblePhone, notes, eventType, insuranceId, termsId, secureTypeId, coverVal, contractor, poliza, certificate, valDeduc} = formState;

  const {dateValid, areaIdValid, attendingSpecialistIdValid, insuranceIdValid, termsIdValid, secureTypeIdValid, coverValValid, valDeducValid} = formValidation;
  const EVENT_TYPE_OPTIONS = [{ id: 1, label: 'page.events.type.private' }, { id: 2, label: 'page.events.type.insurer' }, { id: 3, label: 'page.events.type.social' }];

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
                  invalid={sendForm && !!areaIdValid}
                  feedbackText={sendForm && (areaIdValid || null)}
                />
              </Colxx>
              <Colxx xss={12} sm={6}>
                <SearchSelect
                  name="attendingSpecialistId"
                  inputValue={attendingSpecialistId}
                  onChange={onInputChange}
                  options={listDoctors}
                  label="select.doctorId"
                  invalid={sendForm && !!attendingSpecialistIdValid}
                  feedbackText={sendForm && (attendingSpecialistIdValid || null)}
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
                  maxLength={120}
                />
              </Colxx>
              <Colxx xxs={12} className="mb-2">
                <RadioGroup name="eventType" value={Number(eventType)} onChange={onInputChange} display="flex" options={EVENT_TYPE_OPTIONS} />
              </Colxx>
              {Number(eventType) === 2 && (
                <>
                  <Colxx xss={12} sm={6}>
                    <SearchSelect name="insuranceId" inputValue={insuranceId} onChange={onInputChange} options={insuranceOptions.insurers} label="select.insurerId"
                      invalid={sendForm && !!insuranceIdValid} feedbackText={sendForm && (insuranceIdValid || null)} />
                  </Colxx>
                  <Colxx xss={12} sm={3}>
                    <SearchSelect name="termsId" inputValue={termsId} onChange={onInputChange} options={insuranceOptions.terms} label="select.termsId"
                      invalid={sendForm && !!termsIdValid} feedbackText={sendForm && (termsIdValid || null)} />
                  </Colxx>
                  <Colxx xss={12} sm={3}>
                    <SearchSelect name="secureTypeId" inputValue={secureTypeId} onChange={onInputChange} options={insuranceOptions.secureTypes} label="select.secureTypeId"
                      invalid={sendForm && !!secureTypeIdValid} feedbackText={sendForm && (secureTypeIdValid || null)} />
                  </Colxx>
                  <Colxx xxs={12} sm={6} md={3}>
                    <InputField name="coverVal" label="input.coverVal" onChange={onInputChange} value={coverVal} type="number"
                      invalid={sendForm && !!coverValValid} feedbackText={sendForm && (coverValValid || null)} />
                  </Colxx>
                  <Colxx xxs={12} sm={6} md={3}>
                    <InputField name="valDeduc" label="input.valDeduc" onChange={onInputChange} value={valDeduc} type="number"
                      invalid={sendForm && !!valDeducValid} feedbackText={sendForm && (valDeducValid || null)} />
                  </Colxx>
                  <Colxx xxs={12} sm={4} md={2}>
                    <InputField name="poliza" label="input.poliza" onChange={onInputChange} value={poliza} maxLength={30} />
                  </Colxx>
                  <Colxx xxs={12} sm={4} md={2}>
                    <InputField name="certificate" label="input.certificate" onChange={onInputChange} value={certificate} maxLength={30} />
                  </Colxx>
                  <Colxx xxs={12} sm={4} md={2}>
                    <InputField name="contractor" label="input.contractor" onChange={onInputChange} value={contractor} maxLength={50} />
                  </Colxx>
                </>
              )}
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