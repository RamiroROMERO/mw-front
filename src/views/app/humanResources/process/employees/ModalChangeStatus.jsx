/* eslint-disable react/prop-types */
import { useModalChangeStatus } from './useModalChangeStatus';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import { Checkbox } from '@Components/checkbox';
import DateCalendar from '@Components/dateCalendar';

const ModalChangeStatus = ({data, setOpen}) => {
  const {employeeId, statusEmployee, setLoading, setBulkForm} = data;

  const {formState, formValidation, onInputChange, sendForm, fnSave} = useModalChangeStatus({setLoading, employeeId, statusEmployee, setOpen, setBulkForm});

  const {date, reason, status, isHireable} = formState;

  const {reasonValid, dateValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs={12} md={6}>
          <DateCalendar
            name="date"
            value={date}
            label={status===false?'select.dateDeparture':'select.reentrydate'}
            onChange={onInputChange}
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && (dateValid || null)}
          />
        </Colxx>
        <Colxx xxs={12}>
          <InputField
            name='reason'
            label='input.reason'
            value={reason}
            onChange={onInputChange}
            type='text'
            invalid={sendForm && !!reasonValid}
            feedbackText={sendForm && (reasonValid || null)}
          />
        </Colxx>
        <Colxx xxs={12} md={6}>
          <Checkbox
            label="check.status"
            name="status"
            value={status}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs={12} md={6}>
          <Checkbox
            label="check.isHireable"
            name="isHireable"
            value={isHireable}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalChangeStatus