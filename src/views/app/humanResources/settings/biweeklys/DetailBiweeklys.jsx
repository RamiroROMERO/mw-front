import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { SimpleSelect } from '@Components/simpleSelect'
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import DateCalendar from '@Components/dateCalendar'

const DetailBiweeklys = ({dateIn, dateOut, noBiweekly, noYear, status, onInputChange, formValidation, sendForm, fnClearInputs, fnSave}) => {

  const {noBiweeklyValid, noYearValid, dateInValid, dateOutValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" sm="6" lg="12">
            <SimpleSelect
              name="noBiweekly"
              label="select.noBiweekly"
              value={noBiweekly}
              onChange={onInputChange}
              options={[
                {id:1, name:"Primera"},
                {id:2, name:"Segunda"}
              ]}
              invalid={sendForm && !!noBiweeklyValid}
              feedbackText={sendForm && noBiweeklyValid || null}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12">
            <InputField
              name="noYear"
              label='input.noYear'
              value={noYear}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!noYearValid}
              feedbackText={sendForm && noYearValid || null}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12">
            <DateCalendar
              name="dateIn"
              value={dateIn}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!dateInValid}
              feedbackText={sendForm && dateInValid || null}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" lg="12">
            <DateCalendar
              name="dateOut"
              value={dateOut}
              label='select.dateEnd'
              onChange={onInputChange}
              invalid={sendForm && !!dateOutValid}
              feedbackText={sendForm && dateOutValid || null}
            />
          </Colxx>
          <Colxx xxs="12">
            <Checkbox
              onChange={onInputChange}
              name="status"
              value={status}
              label="check.status"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button color="secondary" onClick={fnClearInputs}>
              <i className="bi bi-stars"/> {IntlMessages("button.clear")}
            </Button>
            <Button color="primary" onClick={fnSave}>
              <i className="iconsminds-save"/> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DetailBiweeklys