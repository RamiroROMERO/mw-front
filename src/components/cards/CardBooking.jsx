import { formatNumber } from '@/helpers/Utils';
import React from 'react'
import {
  Card,
  CardBody,
  CardImg,
  CardTitle,
  Badge,
  Button,
  Row,
  Col,
} from 'reactstrap';

const CardBooking = ({id, image, status, name, type, description, capacity, bedNumber, mealType, price, statusColor, statusId, fnReserve, fnViewDetail }) => {

  return (
    <Card className="mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
      <div className="position-relative">
        <CardImg top src={image} alt={name} style={{ maxHeight: "230px", objectFit: "cover" }}/>
        <div
          className="position-absolute"
          style={{ top: '10px', left: '10px', zIndex: 2 }}
        >
          {status && <Badge color="" style={{backgroundColor: statusColor}}>{status}</Badge>}
        </div>
      </div>
      <CardBody>
        <CardTitle tag="h5" className="mb-1">
          <b>{name}</b> - <small>{type}</small>
        </CardTitle>
        <Row className="align-items-center mb-3">
          <Col xs="6" md={8}>
            {description}
          </Col>
          <Col xs="6" md={4} className="div-action-button-container">
            <Badge color="primary" className="me-2">
              {formatNumber(price, 'L. ', 2)}
            </Badge>
          </Col>
        </Row>
        <Row className="align-items-center">
          <Col xs="12" className="d-flex justify-content-between">
            <span><b>Capacidad</b></span>
            <span>{capacity}</span>
          </Col>
          <Col xs="12" className="d-flex justify-content-between">
            <span><b>Numero de Camas</b></span>
            <span>{bedNumber}</span>
          </Col>
          <Col xs="12" className="d-flex justify-content-between">
            <span><b>Plan de Alimentacion</b></span>
            <span>{mealType}</span>
          </Col>
        </Row>
        <Row>
          <Col xs="12" className="div-action-button-container mt-3" style={{height: 'fit-content'}}>
            {
              statusId==1?
              <Button color="success" onClick={() => fnReserve(id)}>
                <i className="bi bi-check2-circle"/>
                Reservar
              </Button>
              :
              <Button color="warning" onClick={() => fnViewDetail(id)}>
                <i className="bi bi-list"/>
                Ver Detalle
              </Button>
            }
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default CardBooking