import React from 'react'
import ReactTable from '@/components/reactTable'
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { usePurchaseForProvider } from './usePurchaseForProvider';
import HeaderReport from './HeaderReport';
import TotalsReport from '../purchaseReport/TotalsReport';

const Content = ({ setLoading }) => {
  const urlPost = 'inventory/reports/purchases/forProvider';

  const {table, dataTotals, propsToHeaderReport} = usePurchaseForProvider({setLoading, urlPost});

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