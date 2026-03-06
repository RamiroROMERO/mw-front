import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import { InputField } from '@/components/inputFields';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { IntlMessages } from '@/helpers/Utils';
import { Button, Card, CardBody, Row } from 'reactstrap';

const DetailAbsences = ({date, dateStart, dateEnd, employeeId, notes, listEmployees, onInputChange, formValidation, sendForm, fnSaveDocument, fnClear}) => {

  const {dateValid, employeeIdValid, dateStartValid, dateEndValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" xs="5" sm="4" lg="12">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="7" sm="8" lg="12">
            <SearchSelect
              label='select.employee'
              name='employeeId'
              inputValue={employeeId}
              options={listEmployees}
              onChange={onInputChange}
              invalid={sendForm && !!employeeIdValid}
              feedbackText={sendForm && (employeeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="12">
            <DateCalendar
              name="dateStart"
              value={dateStart}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!dateStartValid}
              feedbackText={sendForm && (dateStartValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="6" lg="12">
            <DateCalendar
              name="dateEnd"
              value={dateEnd}
              label='select.dateEnd'
              onChange={onInputChange}
              invalid={sendForm && !!dateEndValid}
              feedbackText={sendForm && (dateEndValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="12" md="12" lg="12">
            <InputField
              name="notes"
              label='input.notes'
              value={notes}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
        </Row>
        <hr/>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSaveDocument}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailAbsences