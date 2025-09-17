import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import { IntlMessages } from '@/helpers/Utils'
import { Checkbox } from '@/components/checkbox'

const HeaderReport = ({providerId, storeId, productId, dateStart, dateEnd, isBonus, listProviders, listStores, listProducts, onInputChange, fnSearchReport}) => {

  return (
    <>
    <Row>
      <Colxx xxs="12" md="6" xl="4">
        <SearchSelect
          label='select.providerId'
          name='providerId'
          inputValue={providerId}
          options={listProviders}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" xl="4">
        <SearchSelect
          label='select.storeId'
          name='storeId'
          inputValue={storeId}
          options={listStores}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" xl="4">
        <SearchSelect
          label='select.productId'
          name='productId'
          inputValue={productId}
          options={listProducts}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <DateCalendar
          name="dateStart"
          label='select.dateStart'
          value={dateStart}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <DateCalendar
          name="dateEnd"
          label='select.dateEnd'
          value={dateEnd}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3">
        <Checkbox
          onChange={onInputChange}
          name="isBonus"
          value={isBonus}
          label="check.isBonus"
        />
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs="12" className="div-action-button-container">
        <Button color="primary" onClick={() => {fnSearchReport()}}>
          <i className='bi bi-search' /> {IntlMessages("button.search")}
        </Button>
      </Colxx>
    </Row>
    </>
  )
}

export default HeaderReport