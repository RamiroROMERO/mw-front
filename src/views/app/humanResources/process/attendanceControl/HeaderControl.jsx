import React from 'react'
import DateCalendar from '@Components/dateCalendar'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Card, CardBody, Row } from 'reactstrap'
import { IntlMessages } from '@Helpers/Utils'

const HeaderControl = ({nameFile, formState, formValidation, sendForm, onInputChange, fnClearInputs, fnImportExcel, fnSave}) => {

  const {dateIn, dateOut} = formState;

  const {dateInValid, dateOutValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs="12" md="6" lg="4">
            <DateCalendar
              name="dateIn"
              value={dateIn}
              label='select.dateStart'
              onChange={onInputChange}
              invalid={sendForm && !!dateInValid}
              feedbackText={sendForm && (dateInValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" md="6" lg="4">
            <DateCalendar
              name="dateOut"
              value={dateOut}
              label='select.dateEnd'
              onChange={onInputChange}
              invalid={sendForm && !!dateOutValid}
              feedbackText={sendForm && (dateOutValid || null)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            {/* import excel buttons */}
            <div className="mb-3 input-group">
              <div className="custom-file">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  id="nameFile"
                  name="nameFile"
                  className="custom-file-input"
                  onChange={fnImportExcel}
                />
                <label className="custom-file-label" htmlFor="load-file">{nameFile}</label>
              </div>
              <div className="input-group-prepend">
                <Button variant="contained" color="success" component="span" onClick={fnSave} style={{marginRight: 5}}>
                  <i className="bi bi-file-arrow-up"/> {IntlMessages("button.import")}
                </Button>
                <Button color="secondary" onClick={fnClearInputs}>
                  <i className="bi bi-stars"/> {IntlMessages("button.clear")}
                </Button>
              </div>
            </div>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default HeaderControl