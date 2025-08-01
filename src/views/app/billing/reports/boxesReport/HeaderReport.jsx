import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { RadioGroup } from '@/components/radioGroup'
import { Button, Row } from 'reactstrap';
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { IntlMessages } from '@/helpers/Utils';

const HeaderReport = ({formState, onTypeChange, onInputChange, listCashiers, listPaymentMethods, showCashier, showPaymentMethod, fnExportToExcel, fnPrintReport}) => {

  const {typeReport, dateStart, dateEnd, cashierId, paymentMethodId} = formState;

  return (
    <>
    <Row>
      <Colxx xxs="12" sm="7" xl="6">
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="select.type"
              name="typeReport"
              value={typeReport}
              onChange={onTypeChange}
              options={[
                {id:1, label: 'page.boxesReport.radio.generalBilling'},
                {id:2, label: 'page.boxesReport.radio.cashierCharges'},
                {id:3, label: 'page.boxesReport.radio.chargesPayMethods'},
                {id:4, label: 'page.boxesReport.radio.closingSummary'}
              ]}
              display="flex"
            />
          </Colxx>
          <Colxx xxs="12" style={{display: showCashier}}>
            <SearchSelect
              label='page.boxesReport.select.cashierId'
              name='cashierId'
              inputValue={cashierId}
              onChange={onInputChange}
              options={listCashiers}
            />
          </Colxx>
          <Colxx xxs="12" style={{display: showPaymentMethod}}>
            <SearchSelect
              label='select.paymentMethod'
              name='paymentMethodId'
              inputValue={paymentMethodId}
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
              name="dateStart"
              label='select.dateStart'
              value={dateStart}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="12" lg="6">
            <DateCalendar
              name="dateEnd"
              label='select.dateEnd'
              value={dateEnd}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs="12" className="div-action-button-container">
        <Button color="secondary" onClick={() => {fnExportToExcel()}}>
          <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.exportXls")}
        </Button>
        <Button color="info" onClick={() => {fnPrintReport()}}>
          <i className='bi bi-printer' /> {IntlMessages("button.print")}
        </Button>
      </Colxx>
    </Row>
    </>
  )
}

export default HeaderReport