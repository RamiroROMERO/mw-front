import React from 'react'
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable'
import { useMonthlySalesCustomer } from './useMonthlySalesCustomer';
import HeaderReport from './HeaderReport';
import TotalsReport from '@/views/app/inventory/reports/purchaseReport/TotalsReport';

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