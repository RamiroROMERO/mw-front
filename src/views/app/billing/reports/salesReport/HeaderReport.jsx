import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import DateCalendar from '@/components/dateCalendar'
import { RadioGroup } from '@/components/radioGroup'
import { Checkbox } from '@/components/checkbox'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { IntlMessages } from '@/helpers/Utils'

const HeaderReport = ({formState, onInputChange, listCustomers, listBillers, listSellers, fnPrintReport, fnOtherReport, onTypeChange, showCustomer, showBiller, showSeller}) => {
  const {dateStart, dateEnd, exportToXls, typeReport, customerId, billerId, sellerId} = formState;
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
                  {id:1, label: 'page.salesReport.radio.generalInvoices'},
                  {id:2, label: 'page.salesReport.radio.productDetail'},
                  {id:3, label: 'page.salesReport.radio.summaryByArea'},
                  {id:4, label: 'page.salesReport.radio.detailedByArea'},
                  {id:5, label: 'page.salesReport.radio.salesByCustomer'},
                  {id:6, label: 'page.salesReport.radio.salesByBiller'},
                  {id:7, label: 'page.salesReport.radio.salesByVendor'},
                  {id:8, label: 'page.salesReport.radio.cashExpenses'}
                ]}
                display="flex"
              />
            </Colxx>
            <Colxx xxs="12" style={{display: showCustomer}}>
              <SearchSelect
                label='select.customer'
                name='customerId'
                inputValue={customerId}
                onChange={onInputChange}
                options={listCustomers}
              />
            </Colxx>
            <Colxx xxs="12" style={{display: showBiller}}>
              <SearchSelect
                label='page.salesReport.select.billerId'
                name='billerId'
                inputValue={billerId}
                onChange={onInputChange}
                options={listBillers}
              />
            </Colxx>
            <Colxx xxs="12" style={{display: showSeller}}>
              <SearchSelect
                label='page.salesReport.select.sellerId'
                name='sellerId'
                inputValue={sellerId}
                onChange={onInputChange}
                options={listSellers}
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
            <Colxx xxs="12" xs="12">
              <Checkbox
                name="exportToXls"
                label='check.exportToXls'
                value={exportToXls}
                onChange={onInputChange}
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="info" onClick={() => {fnPrintReport()}}>
            <i className='bi bi-printer' /> {IntlMessages("button.print")}
          </Button>
          <Button color="success" onClick={() => {fnOtherReport()}}>
            <i className='bi bi-file-earmark-bar-graph' /> {IntlMessages("button.otherReports")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport