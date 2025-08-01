import React from 'react'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import { Button, Card, CardBody, Row } from 'reactstrap'

const Header = ({listProjects, projectId, onProjectChange, fnAddSchedule, fnPrintSchedule}) => {

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={8} lg={8}>
            <SearchSelect
              label='select.project'
              name='projectId'
              inputValue={projectId}
              options={listProjects}
              onChange={onProjectChange}
            />
          </Colxx>
          <Colxx xxs={12} md={4} lg={4} style={{textAlign: 'right'}}>
            <Button color="secondary" onClick={fnAddSchedule} className="mr-1">
              <i className="bi bi-plus"/> {IntlMessages("button.add")}
            </Button>
            <Button color="success" onClick={fnPrintSchedule}>
              <i className="bi bi-printer"/> {IntlMessages("button.print")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Header