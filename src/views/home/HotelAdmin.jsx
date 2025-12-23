import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import Modal from '@Components/modal';
import HotelRoomInventory from './Hotel/HotelRoomInventory';
import { HotelCheckOutToday } from './Hotel/HotelCheckOutToday';
import { HotelOccupancyToday } from './Hotel/HotelOcupancyToday';
import useHotelAdmin from './useHotelAdmin';

const HotelAdmin = ({ setLoading }) => {

  const {propsToModalAddReservation, propsToModalAddCustomer, fnCreateReservation, fnCreateCustomer, setCurrentReservation, setOpenModalAdd } = useHotelAdmin({ setLoading });

  return (
    <>
      <Row>
        <Col xs={12} className='text-right'>
          <Card className='mb-3'>
            <CardBody>
              <Button className='mr-2' color='success' onClick={fnCreateCustomer}> <i className="bi bi-person-plus"></i> Nuevo Cliente </Button>
              <Button color='primary' onClick={fnCreateReservation}> <i className="bi bi-node-plus"></i> Nueva Reservación </Button>
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
          <HotelOccupancyToday setLoading={setLoading} setCurrentReservation={setCurrentReservation} setOpenModalAdd={setOpenModalAdd} />
        </Col>
      </Row>
      <Modal {...propsToModalAddReservation} />
      <Modal {...propsToModalAddCustomer} />
    </>
  )
}

export default HotelAdmin;