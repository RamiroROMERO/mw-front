import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@/components/dateCalendar';
import { useHeader } from './useHeader';

const Header = ({listEmployees, setLoading, table, setTable, enableGenerateReport}) => {
  const {employeeId, formState, onInputChange, onEmployeeId, fnGetData} = useHeader({setLoading, table, setTable, enableGenerateReport});

  const {dateStart, dateEnd} = formState;

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
          <Colxx xxs={12} md={5} lg={3}>
            <DateCalendar
              name="dateStart"
              value={dateStart}
              label='select.dateStart'
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} md={5} lg={3}>
            <DateCalendar
              name="dateEnd"
              value={dateEnd}
              label='select.dateEnd'
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} md={7} lg={12} style={{textAlign: 'right'}}>
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