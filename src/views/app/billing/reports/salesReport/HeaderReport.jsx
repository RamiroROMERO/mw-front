import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import DateCalendar from '@/components/dateCalendar'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { IntlMessages } from '@/helpers/Utils'

const HeaderReport = ({formState, onInputChange, listCustomers, listSellers, listStores, listProducts, fnSearchReport }) => {
  const { customerId, storeId, productCode, sellerId, startDate, endDate } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" md="8" xl="9">
          <Row>
            <Colxx xxs="12" xl="8">
              <SearchSelect
                label='select.customer'
                name='customerId'
                inputValue={customerId}
                onChange={onInputChange}
                options={listCustomers}
              />
            </Colxx>
            <Colxx xxs="12" xl="4">
              <SearchSelect
                label='select.storeId'
                name='storeId'
                inputValue={storeId}
                onChange={onInputChange}
                options={listStores}
              />
            </Colxx>
            <Colxx xxs="12" xl="7">
              <SearchSelect
                label='select.productId'
                name='productCode'
                inputValue={productCode}
                onChange={onInputChange}
                options={listProducts}
              />
            </Colxx>
            <Colxx xxs="12" xl="5">
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
        <Colxx xxs="12" md="4" xl="3">
          <Row>
            <Colxx xxs="12" xs="6" md="12">
              <DateCalendar
                name="startDate"
                label='select.dateStart'
                value={startDate}
                onChange={onInputChange}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" md="12">
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
      <Row className='mb-3'>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={() => { fnSearchReport() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport