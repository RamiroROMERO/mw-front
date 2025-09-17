import React from 'react'
import { usePurchaseForStore } from './usePurchaseForStore'
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable'
import HeaderReport from './HeaderReport';
import TotalsReport from '../purchaseReport/TotalsReport';

const Content = ({ setLoading }) => {

  const {table, dataTotals, propsToHeaderReport} = usePurchaseForStore({setLoading});

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