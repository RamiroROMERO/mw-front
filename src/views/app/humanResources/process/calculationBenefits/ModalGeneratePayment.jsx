import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { useModalGeneratePayment } from './useModalGeneratePayment'
import DateCalendar from '@/components/dateCalendar'
import { InputField } from '@/components/inputFields'

const ModalGeneratePayment = ({data, setOpen}) => {
  const {employeeId, totalBenefits, setLoading} = data;

  const {formState, formValidation, sendForm, onInputChange, onValueChange, onValueQuoteChange, fnSavePaymentPlan} = useModalGeneratePayment({employeeId, totalBenefits, setLoading, setOpen});

  const {date, description, value, noQuotes, valueQuote, startDate, notes} = formState;

  const {dateValid, valueValid, valueQuoteValid, startDateValid, descriptionValid} = formValidation;

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" xs="6" sm="4" lg="3" xl="3">
          <DateCalendar
            name="date"
            value={date}
            label='select.date'
            onChange={onInputChange}
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && (dateValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" md="8" lg="9" xl="5">
          <InputField
            name="description"
            label='input.description'
            value={description}
            onChange={onInputChange}
            type="text"
            invalid={sendForm && !!descriptionValid}
            feedbackText={sendForm && (descriptionValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
          <InputField
            name="value"
            label='input.valueTotal'
            value={value}
            onChange={onValueChange}
            type="text"
            invalid={sendForm && !!valueValid}
            feedbackText={sendForm && (valueValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
          <InputField
            name="valueQuote"
            label='input.valueQuote'
            value={valueQuote}
            onChange={onValueQuoteChange}
            type="text"
            invalid={sendForm && !!valueQuoteValid}
            feedbackText={sendForm && (valueQuoteValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
          <InputField
            name="noQuotes"
            label='input.quota'
            value={noQuotes}
            onChange={onInputChange}
            type="text"
            disabled
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="4" lg="3" xl="2">
          <DateCalendar
            name="startDate"
            value={startDate}
            label='select.dateStart'
            onChange={onInputChange}
            invalid={sendForm && !!startDateValid}
            feedbackText={sendForm && (startDateValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="8" lg="12" xl="8">
          <InputField
            name="notes"
            label='input.notes'
            value={notes}
            onChange={onInputChange}
            type="textarea"
            style={{resize:'none'}}
          />
        </Colxx>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={fnSavePaymentPlan}>
        <i className="iconsminds-save" /> {IntlMessages("button.save")}
      </Button>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
    </ModalFooter>
    </>
  )
}

export default ModalGeneratePayment