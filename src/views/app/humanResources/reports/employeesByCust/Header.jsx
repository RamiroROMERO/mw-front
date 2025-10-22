import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useHeader } from './useHeader'

const Header = ({listCustomers, listWorkShifts, setLoading, table, setTable, enableGenerateReport}) => {

  const {formState, formValidation, sendForm, listProjects, onInputChange, onCustomerChange, fnClear, fnGetData} = useHeader({setLoading, table, setTable, listCustomers, enableGenerateReport});

  const {customerId, projectId, turnId} = formState;

  const {customerIdValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={7} lg={6}>
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
          <Colxx xxs={12} md={5} lg={3}>
            <SearchSelect
              label='select.project'
              name='projectId'
              inputValue={projectId}
              options={listProjects}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} md={6} lg={3}>
            <SearchSelect
              label='select.workShifts'
              name='turnId'
              inputValue={turnId}
              options={listWorkShifts}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} md={6} lg={12} style={{textAlign: 'right'}}>
            <Button
              color="primary" onClick={fnGetData}><i className="iconsminds-save" /> {IntlMessages("button.filter")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Header