import { Button, Card, CardBody, Col, Row, Table } from 'reactstrap';
import { IntlMessages } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from "@Components/reactTable";
import DateCalendar from '@Components/dateCalendar';
import { useHotelRoomInventory } from './useHotelRoomInventory';

const HotelRoomInventory = ({ setLoading }) => {


  const { startDate, setStartDate, endDate, setEndDate, table, fnViewButton } = useHotelRoomInventory({ setLoading });

  return (
    <>
      <Card className='mb-3'>
        <CardBody>
          <Row>
            <Colxx xxs={12} className="mb-3">
              <h3> Inventario de Habitaciones</h3>
            </Colxx>
          </Row>
          <Row>
            <Col xs={12} sm={6} md={4} lg={4}>
              <DateCalendar
                name="startDate"
                value={startDate}
                label='select.dateStart'
                onChange={({ target }) => setStartDate(target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <DateCalendar
                name="endDate"
                value={endDate}
                label='select.dateEnd'
                onChange={({ target }) => setEndDate(target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <Button color='success' onClick={fnViewButton} > <i className='bi bi-search'></i> {IntlMessages('button.search')} </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Row>
        <Col xs={12}>
          <ReactTable {...table} />
        </Col>
      </Row>
    </>
  )
}


export default HotelRoomInventory;