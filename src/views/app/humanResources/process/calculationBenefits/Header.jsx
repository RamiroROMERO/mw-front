import React from 'react'
import { useHeader } from './useHeader';
import { InputField } from '@/components/inputFields';
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import DateCalendar from '@/components/dateCalendar';
import Modal from '@Components/modal';
import { IntlMessages } from '@/helpers/Utils';

const Header = ({listEmployees, listTypes, setLoading, enableGenerateReport, setDataBenefits, otherPayments, totalBenefits}) => {

  const {formState, formValidation, sendForm, onInputChange, onEmployeeId, fnGetData, fnPrintPdf, fnGeneratePaymentPlan, propsToViewPDF, propsToModalGeneratePayments} = useHeader({setLoading, enableGenerateReport, listEmployees, setDataBenefits, otherPayments, totalBenefits});

  const {employeeId, monthlySalary, dateIn, dateOut, typeId} = formState;

  const {employeeIdValid, monthlySalaryValid, dateInValid, dateOutValid, typeIdValid} = formValidation;

  return (
    <>
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} sm={12} md={8} lg={6}>
            <SearchSelect
              label='select.employee'
              name='employeeId'
              inputValue={employeeId}
              options={listEmployees}
              onChange={onEmployeeId}
              invalid={sendForm && !!employeeIdValid}
              feedbackText={sendForm && (employeeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6} md={4} lg={3}>
            <DateCalendar
              name="dateIn"
              value={dateIn}
              label='select.dateIn'
              onChange={onInputChange}
              invalid={sendForm && !!dateInValid}
              feedbackText={sendForm && (dateInValid || null)}
              // disabled
            />
          </Colxx>
          <Colxx xxs={12} sm={6} md={4} lg={3}>
            <DateCalendar
              name="dateOut"
              value={dateOut}
              label='select.dateDeparture'
              onChange={onInputChange}
              invalid={sendForm && !!dateOutValid}
              feedbackText={sendForm && (dateOutValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6} md={4} lg={3}>
            <InputField
              name="monthlySalary"
              label='input.salary'
              value={monthlySalary}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!monthlySalaryValid}
              feedbackText={sendForm && (monthlySalaryValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6} md={4} lg={4}>
            <SearchSelect
              label='select.typeId'
              name='typeId'
              inputValue={typeId}
              options={listTypes}
              onChange={onInputChange}
              invalid={sendForm && !!typeIdValid}
              feedbackText={sendForm && (typeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={12} lg={5} style={{textAlign: 'right'}}>
            <Button
              color="primary" onClick={fnGetData} className="mr-1"><i className="bi bi-calculator" /> {IntlMessages("button.calulate")}
            </Button>
            <Button
              color="secondary" onClick={fnPrintPdf} className="mr-1"><i className="bi bi-printer" /> {IntlMessages("button.print")}
            </Button>
            <Button
              color="success" onClick={fnGeneratePaymentPlan} className="mr-1"><i className="bi bi-currency-dollar" /> {IntlMessages("button.generatePaymentPlan")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
    <Modal {...propsToViewPDF}/>
    <Modal {...propsToModalGeneratePayments}/>
    </>
  )
}

export default Header