import React from 'react';
import {Button, Card, Row, CardBody} from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils'


const DetailInput = ({date, onInputChange, fnGetData}) => {
  return (
    <Card className='mb-3'>
    <CardBody>
      <Row>
        <Colxx xss="6" xs="6" lg="4">
          <DateCalendar
            name="date"
            value={date}
            label="page.retentionReceipt.input.dateIn"
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx>
          <Button
            color="info" onClick={fnGetData} className="mr-1"><i className="bi bi-arrow-clockwise" /> {IntlMessages("button.update")}
          </Button>
        </Colxx>
      </Row>
    </CardBody>
  </Card>
  )
}

export default DetailInput;