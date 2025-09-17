import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useSalesReport } from './useSalesReport';
import HeaderReport from './HeaderReport';
import ReactTable from '@/components/reactTable'
import TotalsReport from '@/views/app/inventory/reports/purchaseReport/TotalsReport';

const SalesReport = ({ setLoading }) => {

  const { table, propsToHeaderReport, totals } = useSalesReport({ setLoading });

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
  );
}
export default SalesReport;