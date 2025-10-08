import React from 'react'
import { Badge, Button, Card, CardBody, CardLink, CardSubtitle, CardText, CardTitle, Row } from 'reactstrap'
import { Colxx } from '../common/CustomBootstrap'
import envs from '../../helpers/envs';


export const CardProduct = ({ id, productName, trademark, imageName, classification, totalStock, fnViewDetail, fnViewPrices }) => {
  return (

    <Card
      style={{
        width: '18rem',
        borderRadius: '10px',
        marginBottom: '20px'
      }}
    >
      <CardBody className='p-4'>
        <Badge color={totalStock > 0 ? "success" : "danger"} className='mb-2 text-white'>
          {`Existencia: ${totalStock}`}
        </Badge>
        <CardTitle tag="h5">
          {productName || ''}
        </CardTitle>
        <CardSubtitle
          className="mb-2 text-muted"
          tag="h6"
        >
          {trademark || ''}
        </CardSubtitle>
      </CardBody>

      <img
        alt="ProductImg"
        src={`${envs.URL_API}assets/pictures/${imageName}`}
        height="100%"
        width="100%"
        crossOrigin="anonymous"
      />
      <CardBody className='m-1 p-2'>
        <CardText>
          {classification}
        </CardText>
        <CardLink className='btn btn-outline-primary' onClick={() => fnViewDetail(id)}>
          Detalle
        </CardLink>
        {/* <CardLink className='btn btn-outline-info' onClick={() => fnViewPrices(id)}>
          Existencias
        </CardLink> */}
      </CardBody>
    </Card>
  )
}
