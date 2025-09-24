import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { Card, CardBody, Progress } from 'reactstrap'

export const CardHotel = ({ title = 'Hotel Card', icon = 'bi bi-info', color = 'primary', value = 0, valueProgress = 50 }) => {
  return (
    <Card className='mb-3'>
      <CardBody className='m-2 p-2'>
        <div className='hotel-card'>
          <div className='clearfix'>
            <div className={`hotel-card-icon bg-${color} text-center`}>
              <i className={`${icon} white`}></i>
            </div>
            <div className='float-end m-3'>
              <div>
                <h6 className='text-center'>{title}</h6>
              </div>
              <div>
                <h3 className='text-center'>{value}</h3>
              </div>
            </div>
          </div>
        </div>
        <Progress color={color} value={valueProgress} style={{ height: '0.4rem' }} />
      </CardBody>
    </Card>
  )
}
