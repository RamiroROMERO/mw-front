import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'

const HeaderReport = ({storeId, destinyId, productId, dateStart, dateEnd, onInputChange, listStores, listProducts, fnSearchReport, fnExportToExcel, fnPrintReport, fnOtherReport}) => {
  return (
    <>
    <Row>
      <Colxx xxs="12" lg="6" xxl="4">
        <SearchSelect
          label='select.storeId'
          name='storeId'
          inputValue={storeId}
          options={listStores}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" lg="6" xxl="4">
        <SearchSelect
          label='select.destinationId'
          name='destinyId'
          inputValue={destinyId}
          options={listStores}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" lg="6" xxl="4">
        <SearchSelect
          label='select.productId'
          name='productId'
          inputValue={productId}
          options={listProducts}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="3">
        <DateCalendar
          name="dateStart"
          label='select.dateStart'
          value={dateStart}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="3">
        <DateCalendar
          name="dateEnd"
          label='select.dateEnd'
          value={dateEnd}
          onChange={onInputChange}
        />
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs="12" className="div-action-button-container">
        <Button color="primary" onClick={() => {fnSearchReport()}}>
          <i className='bi bi-search' /> {IntlMessages("button.search")}
        </Button>
        <Button color="secondary" onClick={() => {fnExportToExcel()}}>
          <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.exportXls")}
        </Button>
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