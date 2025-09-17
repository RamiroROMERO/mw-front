import React from 'react'
import { IntlMessages } from '@/helpers/Utils'
import { Card, CardBody, Row } from 'reactstrap'
import { Colxx } from '../common/CustomBootstrap'
import { ThemeColors } from '@Helpers/ThemeColors';
const colors = ThemeColors();

export const DashCard = ({ title, icon, value }) => {
  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={3}>
            <i className={icon} style={{ fontSize: '2.5rem', fontWeight: 'bold', color: colors.themeColor1 }} />
          </Colxx>
          <Colxx xxs={9}>
            <h5 style={{ color: colors.themeColor2 }}> {IntlMessages(title)} </h5>
            <h2 style={{ color: colors.themeColor1, fontWeight: 'bold' }}>{value}</h2>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}
