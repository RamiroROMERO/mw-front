import React from 'react'
import { useHeader } from './useHeader'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import DateCalendar from '@Components/dateCalendar';

const Header = ({setLoading, table, setTable, enableGenerateReport}) => {

  const {formState, onInputChange, fnGetData} = useHeader({setLoading, table, setTable, enableGenerateReport});

  const {dateStart, dateEnd} = formState;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={6} lg={6}>
            <DateCalendar
              name="dateStart"
              value={dateStart}
              label='select.dateStart'
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} md={6} lg={6}>
            <DateCalendar
              name="dateEnd"
              value={dateEnd}
              label='select.dateEnd'
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} style={{textAlign: 'right'}}>
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