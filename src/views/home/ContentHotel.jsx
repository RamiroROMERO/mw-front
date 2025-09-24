import React from 'react'
import { CardHotel } from '@/components/cards'
import PieChart from '@/components/charts/PieChart'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Card, CardBody, Row, Table } from 'reactstrap'

const ContentHotel = ({ setLoading }) => {

  const labelProductsBest = ['Disponible', 'Ocupada', 'Bloqueada', 'Mantenimiento'];
  const dataProductsBest = [
    {
      label: 'Habitaciones',
      data: [{ label: 'Disponible', value: 4 }, { label: 'Ocupada', value: 8 }, { label: 'Bloqueada', value: 2 }, { label: 'Mantenimiento', value: 1 }]
    }
  ]

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
          <Card>
            <CardBody>
              <h4>Detalle de Reservas</h4>
              <Table
                bordered
                striped
              >
                <thead>
                  <tr>
                    <th>
                      #
                    </th>
                    <th>
                      First Name
                    </th>
                    <th>
                      Last Name
                    </th>
                    <th>
                      Habitación
                    </th>
                    <th>
                      Tiempo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      1
                    </th>
                    <td>
                      Mark
                    </td>
                    <td>
                      Otto
                    </td>
                    <td>
                      1
                    </td>
                    <td>
                      1
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      2
                    </th>
                    <td>
                      Jacob
                    </td>
                    <td>
                      Thornton
                    </td>
                    <td>
                      3
                    </td>
                    <td>
                      1
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      3
                    </th>
                    <td>
                      Larry
                    </td>
                    <td>
                      the Bird
                    </td>
                    <td>
                      8
                    </td>
                    <td>
                      2
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      1
                    </th>
                    <td>
                      Mark
                    </td>
                    <td>
                      Otto
                    </td>
                    <td>
                      1
                    </td>
                    <td>
                      1
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      2
                    </th>
                    <td>
                      Jacob
                    </td>
                    <td>
                      Thornton
                    </td>
                    <td>
                      3
                    </td>
                    <td>
                      1
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      3
                    </th>
                    <td>
                      Larry
                    </td>
                    <td>
                      the Bird
                    </td>
                    <td>
                      8
                    </td>
                    <td>
                      2
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      1
                    </th>
                    <td>
                      Mark
                    </td>
                    <td>
                      Otto
                    </td>
                    <td>
                      1
                    </td>
                    <td>
                      1
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      2
                    </th>
                    <td>
                      Jacob
                    </td>
                    <td>
                      Thornton
                    </td>
                    <td>
                      3
                    </td>
                    <td>
                      1
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">
                      3
                    </th>
                    <td>
                      Larry
                    </td>
                    <td>
                      the Bird
                    </td>
                    <td>
                      8
                    </td>
                    <td>
                      2
                    </td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>

        </Colxx>
        <Colxx xxs={12} md={4}>
          <PieChart title='dasboard.title.bestSellingProducts' labels={labelProductsBest} dataChart={dataProductsBest} />
        </Colxx>
      </Row>
    </>
  )
}


export default ContentHotel;