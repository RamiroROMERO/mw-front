import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import ReactTable from '@Components/reactTable'
import { useMonthlySalesCustomer } from './useMonthlySalesCustomer';
import HeaderReport from './HeaderReport';
import TotalsReport from '@Views/app/inventory/reports/purchaseReport/TotalsReport';

const Content = ({ setLoading }) => {

  const {totals, table, propsToHeaderReport} = useMonthlySalesCustomer({setLoading});

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className='mb-3'>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
          <Row>
            <Colxx xxs="12">
              <ReactTable {...table} />
            </Colxx>
          </Row>
          <Card className='mb-3 mt-3'>
            <CardBody>
              <TotalsReport {...totals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  )
}

export default Content