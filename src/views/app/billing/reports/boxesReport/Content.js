import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useBoxesReport } from './useBoxesReport';
import HeaderReport from './HeaderReport';

const BoxesReport = ({ setLoading }) => {

  const { formState, onInputChange, onTypeChange, listCashiers, listPaymentMethods, showCashier, showPaymentMethod, fnExportToExcel, fnPrintReport } = useBoxesReport({ setLoading });

  const propsToHeader = {
    formState,
    onInputChange,
    onTypeChange,
    listCashiers,
    listPaymentMethods,
    showCashier,
    showPaymentMethod,
    fnPrintReport,
    fnExportToExcel
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <HeaderReport {...propsToHeader} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default BoxesReport;