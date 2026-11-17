import ReactTable from '@Components/reactTable'
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { usePurchaseForProvider } from './usePurchaseForProvider';
import HeaderReport from './HeaderReport';
import TotalsReport from '../purchaseReport/TotalsReport';

const Content = ({ setLoading }) => {
  const type = 'byProvider';

  const {table, dataTotals, propsToHeaderReport} = usePurchaseForProvider({setLoading, type});

  const propsToTotals = {
    ...dataTotals
  }

  return (
    <>
      <Row>
        <Colxx xxs="12" className='mb-3'>
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeaderReport} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className='mb-3'>
            <ReactTable {...table}/>
          </Colxx>
        </Row>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <TotalsReport {...propsToTotals} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  )
}

export default Content