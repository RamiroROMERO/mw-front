import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { IntlMessages } from '@/helpers/Utils';
import { Button, Row } from 'reactstrap';
import { RadioGroup } from '@/components/radioGroup';

const HeaderReport = ({formState, onInputChange, listCustomers, fnSearchReport }) => {
  const { customerId, startDate, endDate, typeDocto } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" md="8" xl="9">
          <Row>
            <Colxx xxs="12" xs="6" lg="8">
              <SearchSelect
                label='select.customer'
                name='customerId'
                inputValue={customerId}
                onChange={onInputChange}
                options={listCustomers}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="4">
              <RadioGroup
                label="page.invoicing.title.salesType"
                name="typeDocto"
                value={typeDocto}
                onChange={onInputChange}
                options={
                  [
                    { id: 1, label: "page.invoicing.radio.cash" },
                    { id: 2, label: "page.invoicing.radio.credit" },
                    { id: 3, label: "radio.all" }
                  ]
                }
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