import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import DateCalendar from '@/components/dateCalendar';
import { useHeader } from './useHeader';
import SearchSelect from '@/components/SearchSelect/SearchSelect';

const Header = ({setLoading, table, setTable, enableGenerateReport, listProjects, listTypeIncomes}) => {

  const {formState, onInputChange, fnGetData} = useHeader({setLoading, table, setTable, enableGenerateReport, listTypeIncomes});

  const {projectId, dateStart, dateEnd} = formState;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={7} lg={6}>
            <SearchSelect
              label='select.project'
              name='projectId'
              inputValue={projectId}
              options={listProjects}
              onChange={onInputChange}
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