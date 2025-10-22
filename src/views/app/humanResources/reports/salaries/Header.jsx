/* eslint-disable react/prop-types */
import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { useHeader } from './useHeader';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';

const Header = ({listEmployees, setLoading, table, setTable, enableGenerateReport}) => {

  const {employeeId, salaryParam, bankAccountParam, onEmployeeId, onSalaryChange, onBankAccountChange, fnGetData} = useHeader({setLoading, table, setTable, enableGenerateReport});

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={7} lg={6}>
            <SearchSelect
              label='select.employee'
              name='employeeId'
              inputValue={employeeId}
              options={listEmployees}
              onChange={onEmployeeId}
            />
          </Colxx>
          <Colxx xxs={12} md={3} lg={3}>
            <Checkbox
              label="check.salaryParam"
              name="salaryParam"
              value={salaryParam}
              onChange={onSalaryChange}
            />
          </Colxx>
          <Colxx xxs={12} md={3} lg={3}>
            <Checkbox
              label="check.bankAccountParam"
              name="bankAccountParam"
              value={bankAccountParam}
              onChange={onBankAccountChange}
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