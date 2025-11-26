import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, CardBody, CardTitle, Col, Row, Table } from 'reactstrap'
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { request } from '@/helpers/core';

export const HotelOccupancyToday = ({ setLoading }) => {

  const [currentDate, setCurrentDate] = useState(new Date().toJSON().substring(0, 10));
  const [dataOccupancy, setDataOccupancy] = useState([]);
  const [totalOccupancy, setTotalOccupancy] = useState(0);

  const fnRefreshTable = () => {
    setLoading(true);
    request.GET(`hotel/dashboard/getOccupancyToday?currentDate=${currentDate}`, resp => {
      setLoading(false);
      const { data } = resp;
      setDataOccupancy(data);
      setTotalOccupancy(data.length || 0);
    }, err => {
      setLoading(false);
      setDataOccupancy([]);
      setTotalOccupancy(0);
    })
  }

  const fnGotoViewBooking = (bookingId) => {
    console.log({ bookingId });
  }

  useEffect(() => {
    fnRefreshTable()
  }, []);


  return (
    <>
      <Row>
        <Col xs={12}>
          <Card className='mb-3'>
            <CardBody>
              <CardTitle tag="h4">
                Ocupacion de Hoy <Badge className='text-white' color='primary'>{totalOccupancy}</Badge>
              </CardTitle>
              <Row>
                <Col xs={8} md={7} lg={8}>
                  <DateCalendar
                    name="currentDate"
                    value={currentDate}
                    label='select.date'
                    onChange={({ target }) => setCurrentDate(target.value)}
                  />
                </Col>
                <Col xs={4} md={5} lg={4}>
                  <Button color='primary' onClick={fnRefreshTable}> <i className='bi bi-search'></i> {IntlMessages("button.search")} </Button>
                </Col>
              </Row>
              <Table hover
                responsive
                size="sm">
                <thead>
                  <tr>
                    <th>
                      # Hab.
                    </th>
                    <th>
                      Cliente
                    </th>
                    <th>Estancia (dias)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dataOccupancy.map((item, idx) => {
                    return (<tr>
                      <td>{item.roomCode}</td>
                      <td>{item.customerName}</td>
                      <td>{item.currentDays}</td>
                      <td><Button color='primary' onClick={() => fnGotoViewBooking(item.bookingId)} ><i className='bi bi-eye'></i></Button></td>
                    </tr>)
                  })}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}
