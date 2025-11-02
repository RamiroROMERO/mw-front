import React from 'react'
import { CardHotel } from '@/components/cards'
import PieChart from '@/components/charts/PieChart'
import ReactTable from "@Components/reactTable";
import { Colxx } from '@/components/common/CustomBootstrap'
import { Card, CardBody, Row, Table } from 'reactstrap'
import { useContentHotel } from './useContentHotel'
import { RadioGroup } from '@/components/radioGroup';
import DateCalendar from '@/components/dateCalendar';

const ContentHotel = ({ setLoading }) => {

  const labelProductsBest = ['Disponible', 'Ocupada', 'Bloqueada', 'Mantenimiento'];
  const dataProductsBest = [
    {
      label: 'Habitaciones',
      data: [{ label: 'Disponible', value: 4 }, { label: 'Ocupada', value: 8 }, { label: 'Bloqueada', value: 2 }, { label: 'Mantenimiento', value: 1 }]
    }
  ]

  const {table, formState, onInputChange} = useContentHotel({setLoading});

  const {date, type} = formState;

  return (
    <>
      <Row>
        <Colxx xxs={12} sm={6} md={4} lg={3}>
          <CardHotel icon='bi bi-receipt' title='Total Reservas ' value='1,245' valueProgress={70} color='primary' />
          {/* <DashCard title='button.clear' value='L. 123,393' icon='bi bi-bank' /> */}
        </Colxx>
        <Colxx xxs={12} sm={6} md={4} lg={3}>
          <CardHotel icon='bi bi-segmented-nav' title='Hab. Disponibles' value='30' valueProgress={60} color='secondary' />
        </Colxx>
        <Colxx xxs={12} sm={6} md={4} lg={3}>
          <CardHotel icon='bi bi-people-fill' title='Nuevos Clientes' value='20' valueProgress={80} color='success' />
        </Colxx>
        <Colxx xxs={12} sm={6} md={4} lg={3}>
          <CardHotel icon='bi bi-currency-dollar' title='Ingresos Totales' value='L. 35,400' valueProgress={35} color='info' />
        </Colxx>
      </Row >
      <Row>
        <Colxx xxs={12} md={8}>
          <Card className='mb-3'>
            <CardBody>
              <Row>
                <Colxx xxs={12} md={6}>
                  <DateCalendar
                    name="date"
                    value={date}
                    label='select.date'
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6}>
                  <RadioGroup
                    label="select.status"
                    name="type"
                    value={type}
                    onChange={onInputChange}
                    options={
                      [
                        { id: 1, label: "radio.availability" },
                        { id: 2, label: "radio.occupancy" }
                      ]
                    }
                  />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
          <ReactTable {...table} />

        </Colxx>
        <Colxx xxs={12} md={4}>
          <PieChart title='dasboard.title.bestSellingProducts' labels={labelProductsBest} dataChart={dataProductsBest} />
        </Colxx>
      </Row>
    </>
  )
}


export default ContentHotel;