import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import { IntlMessages } from '@/helpers/Utils'

const HeaderReport = ({storeId, dateStart, dateEnd, listStores, onInputChange, fnSearchReport}) => {

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
      </Colxx>
    </Row>
    </>
  )
}

export default HeaderReport