import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { IntlMessages } from '@/helpers/Utils';
import { Button, Row } from 'reactstrap';
import { InputField } from '@/components/inputFields';

const HeaderReport = ({formState, onInputChange, listCustomers, fnSearchReport }) => {
  const { customerId, noYear } = formState;

  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" xl="4">
          <SearchSelect
            label='select.customer'
            name='customerId'
            inputValue={customerId}
            onChange={onInputChange}
            options={listCustomers}
          />
        </Colxx>
        <Colxx xxs="12" md="6" xl="4">
          <InputField
            value={noYear}
            name="noYear"
            onChange={onInputChange}
            type="text"
            label="input.noYear"
          />
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