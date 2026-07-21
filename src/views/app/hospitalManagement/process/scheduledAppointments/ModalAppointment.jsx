import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'
import { useModalAppointment } from './useModalAppointment'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import Confirmation from '@Containers/ui/confirmationMsg'

const ModalAppointment = ({ data, setOpen }) => {
  const { currentItem, listDoctors, listPatients, listReasons, setLoading, fnGetData } = data;

  const {
    formState, formValidation, sendForm, onInputChange, fnSaveDocument,
    fnCancelAppointment, propsToMsgCancel
  } = useModalAppointment({ currentItem, setLoading, fnGetData, setOpen });

  const { id, patientId, specialistId, date, time, reasonId, notes } = formState;

  const { patientIdValid, specialistIdValid, dateValid, timeValid } = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <SearchSelect
              name="patientId"
              inputValue={patientId}
              onChange={onInputChange}
              options={listPatients}
              label="select.patientId"
              invalid={sendForm && !!patientIdValid}
              feedbackText={sendForm && (patientIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <SearchSelect
              name="specialistId"
              inputValue={specialistId}
              onChange={onInputChange}
              options={listDoctors}
              label="select.doctorId"
              invalid={sendForm && !!specialistIdValid}
              feedbackText={sendForm && (specialistIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <SearchSelect
              name="reasonId"
              inputValue={reasonId}
              onChange={onInputChange}
              options={listReasons}
              label="select.reasonId"
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <DateCalendar
              name="date"
              value={date}
              label="select.appointmentDate"
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
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
          <Colxx xxs={12}>
            <InputField
              name="notes"
              type="textarea"
              label="input.notes"
              value={notes}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveDocument}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        {id > 0 ? (
          <Button color="secondary" onClick={fnCancelAppointment}>
            <i className="bi bi-x-circle" />{` ${IntlMessages('button.cancelAppointment')}`}
          </Button>
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
