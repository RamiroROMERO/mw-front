import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { useModalAppointment } from './useModalAppointment'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { RadioGroup } from '@Components/radioGroup'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import Confirmation from '@Containers/ui/confirmationMsg'
import { TYPE_FREE, TYPE_PATIENT } from './appointmentRules'

const TYPE_OPTIONS = [{ id: TYPE_PATIENT, label: 'page.appointments.type.patient' }, { id: TYPE_FREE, label: 'page.appointments.type.free' }];

const ModalAppointment = ({ data, setOpen }) => {
  const { currentItem, listDoctors, listPatients, listSpecialties, setLoading, fnGetData } = data;

  const {
    formState, formValidation, sendForm, isNew, onInputChange, onTypeChange, fnSaveDocument, fnReschedule,
    fnCancelAppointment, propsToMsgCancel
  } = useModalAppointment({ currentItem, setLoading, fnGetData, setOpen });

  const { typeId, patientId, name, specialistId, specialtyId, date, time, phone, notes, turnNumber } = formState;
  const { patientIdValid, nameValid, specialistIdValid, dateValid, timeValid } = formValidation;
  const isPatient = Number(typeId) === TYPE_PATIENT;

  return (
    <>
      <ModalBody>
        <Row>
          {isNew && (
            <Colxx xxs={12} className="mb-2">
              <RadioGroup name="typeId" value={Number(typeId)} onChange={onTypeChange} display="flex" options={TYPE_OPTIONS} />
            </Colxx>
          )}
          <Colxx xxs={12}>
            {isPatient ? (
              <SearchSelect
                name="patientId"
                inputValue={patientId}
                onChange={onInputChange}
                options={listPatients}
                label="select.patientId"
                isDisabled={!isNew}
                invalid={sendForm && !!patientIdValid}
                feedbackText={sendForm && (patientIdValid || null)}
              />
            ) : (
              <InputField
                name="name"
                label="input.name"
                value={name}
                onChange={onInputChange}
                maxLength={50}
                invalid={sendForm && !!nameValid}
                feedbackText={sendForm && (nameValid || null)}
              />
            )}
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <SearchSelect
              name="specialistId"
              inputValue={specialistId}
              onChange={onInputChange}
              options={listDoctors}
              label="select.doctorId"
              isDisabled={!isNew}
              invalid={sendForm && !!specialistIdValid}
              feedbackText={sendForm && (specialistIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <SearchSelect
              name="specialtyId"
              inputValue={specialtyId}
              onChange={onInputChange}
              options={listSpecialties}
              label="select.specialtyId"
              isDisabled={!isNew}
            />
          </Colxx>
          <Colxx xxs={12} sm={4}>
            <DateCalendar
              name="date"
              value={date}
              label="select.appointmentDate"
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={4}>
            <InputField
              name="time"
              type="time"
              label="select.appointmentTime"
              value={time}
              onChange={onInputChange}
              invalid={sendForm && !!timeValid}
              feedbackText={sendForm && (timeValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={4}>
            <InputField name="phone" label="input.phone" value={phone} onChange={onInputChange} maxLength={30} />
          </Colxx>
          {!isNew && (
            <Colxx xxs={12} sm={4}>
              <InputField name="turnNumber" label="input.turnNumber" value={turnNumber} disabled />
            </Colxx>
          )}
          <Colxx xxs={12}>
            <InputField name="notes" type="textarea" label="input.notes" value={notes} onChange={onInputChange} maxLength={100} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveDocument}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        {!isNew ? (
          <>
            <Button color="info" onClick={fnReschedule}>
              <i className="bi bi-calendar-event" />{` ${IntlMessages('button.rescheduleAppointment')}`}
            </Button>
            <Button color="secondary" onClick={fnCancelAppointment}>
              <i className="bi bi-x-circle" />{` ${IntlMessages('button.cancelAppointment')}`}
            </Button>
          </>
        ) : ''}
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgCancel} />
    </>
  )
}

export default ModalAppointment
