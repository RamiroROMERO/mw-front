import CardTotals from '@/components/cardTotals/CardTotals';
import BarChart from '@/components/charts/BarChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Card, CardBody, Row, Table } from 'reactstrap';
import { useSales } from './useSales';
import HeaderDash from './HeaderDash';
import { formatNumber } from '@/helpers/Utils';

const Content = ({ setLoading }) => {

  const { dataAllSales, dataTotals, dataMonthDetail, labelSales, dataProductsBest, labelProductsBest, dataSalesForSeller, labelSalesForSeller, dataSalesForClassif, labelSalesForClassif, dataSalesForDepto, labelSalesForDepto, propsToHeaderReport } = useSales({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className='mb-3'>
            <CardBody>
              <HeaderDash {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12}>
          <CardTotals data={dataTotals}/>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12} lg={6}>
          <Row>
            <Colxx xxs={12}>
              <Card className='mb-3'>
                <CardBody>
                  <Table hover
                    responsive
                    bordered
                    size="sm">
                    <thead>
                      <tr>
                        <th>
                          Mes
                        </th>
                        <th>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataMonthDetail.length > 0 ? dataMonthDetail.map((item, idx) => {
                        return (<tr key={idx}>
                          <td>{item.monthName}</td>
                          <td>{formatNumber(item.total, 'L. ', 2)}</td>
                        </tr>)
                      }) : <tr><td className='text-center' colSpan={4}> No hay datos Disponibles</td></tr>}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Colxx>
            <Colxx xxs={12}>
              <LineChart title='dasboard.title.totalSales' labels={labelSales} dataChart={dataAllSales} />
            </Colxx>
            <Colxx xxs={12}>
              <BarChart title='dasboard.title.salesForSeller' labels={labelSalesForSeller} dataChart={dataSalesForSeller} />
            </Colxx>
            <Colxx xxs={12}>
              <BarChart title='dasboard.title.salesForClassification' labels={labelSalesForClassif} dataChart={dataSalesForClassif} type="y" />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs={12} lg={6}>
          <Row>
            <Colxx xxs={12}>
              <PieChart title='dasboard.title.bestSellingProducts' labels={labelProductsBest} dataChart={dataProductsBest} />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs={12}>
              <DoughnutChart title='dasboard.title.salesByLocation' labels={labelSalesForDepto} dataChart={dataSalesForDepto} />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
    </>
  )
}

export default Content