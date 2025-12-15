import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useSalesReport } from './useSalesReport';
import HeaderReport from './HeaderReport';
import ReactTable from '@/components/reactTable'
import TotalsReport from '@/views/app/inventory/reports/purchaseReport/TotalsReport';
import Modal from '@Components/modal';
import { InputField } from '@/components/inputFields';
import { formatNumber } from '@/helpers/Utils';
import ModalSummary from './ModalSummary';

const SalesReport = ({ setLoading }) => {

  const { table, tableSummary, propsToHeaderReport, totals, valChangeUsd, totalsSummary, openModalSummary, setOpenModalSummary } = useSalesReport({ setLoading });

  const propsToModalSummary = {
    ModalContent: ModalSummary,
    title: "page.salesReport.modal.summary.title",
    open: openModalSummary,
    setOpen: setOpenModalSummary,
    maxWidth: 'lg',
    data: {
      tableSummary,
      totalsSummary
    }
  }

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
      <Row>
        <Colxx xxs={12}>
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs={12} sm={4} md={3} lg={2}>
                  <InputField
                    name="totalUSD"
                    label='input.totalUSD'
                    value={formatNumber((totals['total'] / valChangeUsd), '', 2)}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} sm={4} md={3} lg={2}>
                  <InputField
                    name="totalCostUSD"
                    label='input.totalCostUSD'
                    value={formatNumber((totals['costValue'] / valChangeUsd), '', 2)}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} sm={4} md={3} lg={2}>
                  <InputField
                    name="saleDiffUSD"
                    label='input.saleDiffUSD'
                    value={formatNumber(((totals['total'] - totals['costValue']) / valChangeUsd), '', 2)}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs={12} sm={4} md={3} lg={2}>
                  <InputField
                    name="changeValueUsd"
                    label='input.changeValueUsd'
                    value={formatNumber(valChangeUsd, '', 4)}
                    type="text"
                    disabled
                  />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalSummary} />
    </>
  );
}
export default SalesReport;