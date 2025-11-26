import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import HotelRoomInventory from './Hotel/HotelRoomInventory';
import { HotelCheckOutToday } from './Hotel/HotelCheckOutToday';
import { HotelOccupancyToday } from './Hotel/HotelOcupancyToday';

const HotelAdmin = ({ setLoading }) => {

  const fnCreateReservation = () => {

  }

  return (
    <>
      <Row>
        <Col xs={12} className='text-right'>
          <Card className='mb-3'>
            <CardBody>
              <Button color='primary' onClick={fnCreateReservation}> <i className='bi bi-new'></i> Nueva Reservación </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={8} lg={7}>
          <HotelRoomInventory setLoading={setLoading} />
        </Col>
        <Col xs={12} md={4} lg={5}>
          <HotelCheckOutToday setLoading={setLoading} />
          <HotelOccupancyToday setLoading={setLoading} />
        </Col>
      </Row>
    </>
  )
}

export default HotelAdmin;