import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Button, Row } from 'reactstrap';
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { IntlMessages } from '@/helpers/Utils';

const HeaderReport = ({formState, onInputChange, listCashiers, listPaymentMethods, listCashRegisters, fnSearchReport, fnViewSummary}) => {

  const {startDate, endDate, cashierId, cashId, paymentTypeId} = formState;

  return (
    <>
    <Row>
      <Colxx xxs="12" sm="7" xl="6">
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label='select.cashId'
              name='cashId'
              inputValue={cashId}
              onChange={onInputChange}
              options={listCashRegisters}
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label='page.boxesReport.select.cashierId'
              name='cashierId'
              inputValue={cashierId}
              onChange={onInputChange}
              options={listCashiers}
            />
          </Colxx>
          <Colxx xxs="12">
            <SearchSelect
              label='select.paymentMethod'
              name='paymentTypeId'
              inputValue={paymentTypeId}
              onChange={onInputChange}
              options={listPaymentMethods}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" sm="5" xl="6">
        <Row>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <DateCalendar
              name="startDate"
              label='select.dateStart'
              value={startDate}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <DateCalendar
              name="endDate"
              label='select.dateEnd'
              value={endDate}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs="12" className="div-action-button-container">
        <Button color="primary" onClick={() => { fnSearchReport() }}>
          <i className='bi bi-search' /> {IntlMessages("button.search")}
        </Button>
        <Button color="secondary" onClick={() => { fnViewSummary() }}>
          <i className='bi bi-list' /> {IntlMessages("button.summary")}
        </Button>
      </Colxx>
    </Row>
    </>
  )
}

export default HeaderReport