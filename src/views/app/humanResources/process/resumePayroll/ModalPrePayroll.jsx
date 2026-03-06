import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { usePrePayroll } from './usePrePayroll';
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import DateCalendar from '@/components/dateCalendar';
import ReactTable from '@Components/reactTable';
import Modal from '@Components/modal';
import { IntlMessages } from '@/helpers/Utils';
import FooterPayroll from './FooterPayroll';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import Confirmation from '@/containers/ui/confirmationMsg';

const ModalPrePayroll = ({data, setOpen}) => {
  const {listCustomers, listProjects, listTypeDeductions, listEmployees, listJobPositions, listPaymentMethod, listSchedules,listTypeIncomes, listProjectsFilter, setListProjectsFilter, enableConfidentialPayroll, setLoading, userData, fnViewDetailPayroll, onBulkForm} = data;

  const {formStateDeta, formValidationDeta, sendForm, dataTotals, table, onInputChangeDeta, onCustomerChange, fnViewPrePayroll, fnGeneratePayroll, propsToModalDetailPay, propsToMsgGeneratePayroll} = usePrePayroll({setLoading, listProjects, listTypeDeductions, listEmployees, listJobPositions, listPaymentMethod, listSchedules, listTypeIncomes, userData, fnViewDetailPayroll, onBulkForm, setOpen, setListProjectsFilter});

  const {customerId, projectId, date, dateStart, dateEnd, notes, isConfidential} = formStateDeta;

  const {customerIdValid, projectIdValid, dateValid, dateStartValid, dateEndValid} = formValidationDeta;

  const propsToFooter = {
    dataTotals,
    typePayroll: 1
  }

  return (
    <>
    <ModalBody>
      <Row>
        <Colxx xxs="12" sm="12" lg="8" xl="7">
          <SearchSelect
            label='select.customer'
            name='customerId'
            inputValue={customerId}
            options={listCustomers}
            onChange={onCustomerChange}
            invalid={sendForm && !!customerIdValid}
            feedbackText={sendForm && (customerIdValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="12" lg="4" xl="5">
          <SearchSelect
            label='page.dailyReport.select.projectId'
            name='projectId'
            inputValue={projectId}
            options={listProjectsFilter}
            onChange={onInputChangeDeta}
            invalid={sendForm && !!projectIdValid}
            feedbackText={sendForm && (projectIdValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="3" xl="3">
          <DateCalendar
            name="date"
            value={date}
            label='select.date'
            onChange={onInputChangeDeta}
            invalid={sendForm && !!dateValid}
            feedbackText={sendForm && (dateValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="3">
          <DateCalendar
            name="dateStart"
            value={dateStart}
            label='select.dateStart'
            onChange={onInputChangeDeta}
            invalid={sendForm && !!dateStartValid}
            feedbackText={sendForm && (dateStartValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="3">
          <DateCalendar
            name="dateEnd"
            value={dateEnd}
            label='select.dateEnd'
            onChange={onInputChangeDeta}
            invalid={sendForm && !!dateEndValid}
            feedbackText={sendForm && (dateEndValid || null)}
          />
        </Colxx>
        <Colxx xxs="12" sm="6" lg="3" style={{ display: enableConfidentialPayroll === false ? 'none' : 'block' }}>
          <Checkbox
            label='check.isConfidential'
            name="isConfidential"
            value={isConfidential}
            onChange={onInputChangeDeta}
          />
        </Colxx>
        <Colxx xxs="12" sm="12" lg={8}>
          <InputField
            name="notes"
            label='input.notes'
            value={notes}
            onChange={onInputChangeDeta}
            type="textarea"
          />
        </Colxx>
        <Colxx xxs={12} sm={12} lg={4} xl={4} align="right">
          <Button color="outline-primary"
            onClick={fnViewPrePayroll}>
            <i className='bi bi-cash-coin' />
            {` ${IntlMessages('button.getPrePayroll')}`}
          </Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <FooterPayroll {...propsToFooter}/>
    </ModalBody>
    <ModalFooter>
      <Button color="danger" onClick={()=>{setOpen(false)}} >
        <i className="bi bi-box-arrow-right"/>
        {` ${IntlMessages('button.exit')}`}
      </Button>
      <Button color="primary" onClick={fnGeneratePayroll}>
        <i className="bi bi-check-lg"/> {IntlMessages("button.generatePayroll")}
      </Button>
    </ModalFooter>
    <Modal {...propsToModalDetailPay}/>
    <Confirmation {...propsToMsgGeneratePayroll}/>
    </>
  )
}

export default ModalPrePayroll