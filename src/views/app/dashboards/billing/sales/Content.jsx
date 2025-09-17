import CardTotals from '@/components/cardTotals/CardTotals';
import BarChart from '@/components/charts/BarChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import { Colxx } from '@/components/common/CustomBootstrap';
import { Card, CardBody, Row } from 'reactstrap';
import { useSales } from './useSales';
import HeaderDash from './HeaderDash';

const Content = ({ setLoading }) => {

  const { dataAllSales, labelSales, dataProductsBest, labelProductsBest, dataSalesForSeller, labelSalesForSeller, dataSalesForClassif, labelSalesForClassif, dataSalesForDepto, labelSalesForDepto, propsToHeaderReport } = useSales({ setLoading });

  // const dataTotals = [
  //   {
  //     title: 'Ventas Totales',
  //     value: '7,366,353'
  //   },
  //   {
  //     title: 'Promedio Mensual',
  //     value: '7,373,635'
  //   },
  // ]

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
      {/* <CardTotals data={dataTotals}/> */}
      <Row>
        <Colxx xxs={12} lg={6}>
          <Row>
            <Colxx xxs={12}>
              <LineChart title='dasboard.title.totalSales' labels={labelSales} dataChart={dataAllSales} />
            </Colxx>
          </Row>
          <Row>
            <Colxx xxs={12}>
              <BarChart title='dasboard.title.salesForSeller' labels={labelSalesForSeller} dataChart={dataSalesForSeller} />
            </Colxx>

          </Row>
        </Colxx>
        <Colxx xxs={12} lg={6}>
          <PieChart title='dasboard.title.bestSellingProducts' labels={labelProductsBest} dataChart={dataProductsBest} />
        </Colxx>
        <Colxx xxs={12} lg={6}>
          <BarChart title='dasboard.title.salesForClassification' labels={labelSalesForClassif} dataChart={dataSalesForClassif} type="y" />
        </Colxx>
        <Colxx xxs={12} lg={6}>
          <DoughnutChart title='dasboard.title.salesByLocation' labels={labelSalesForDepto} dataChart={dataSalesForDepto} />
        </Colxx>
      </Row>
    </>
  )
}

export default Content