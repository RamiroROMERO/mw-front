import { Col, Row } from 'reactstrap';
import HotelRoomInventory from './Hotel/HotelRoomInventory';
import { HotelCheckOutToday } from './Hotel/HotelCheckOutToday';
import { HotelOccupancyToday } from './Hotel/HotelOcupancyToday';

const HotelAdmin = ({ setLoading }) => {

  return (
    <>
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