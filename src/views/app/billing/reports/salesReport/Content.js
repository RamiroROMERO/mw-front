import React from 'react';
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import Modal from "@/components/modal";
import { useSalesReport } from './useSalesReport';
import HeaderReport from './HeaderReport';
import ModalOtherReports from './ModalOtherReports';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useForm } from '@Hooks/useForms';
import DateCalendar from '@Components/dateCalendar';
// import IntlMessages from '@Helpers/IntlMessages';
import ReactTable from '@/components/reactTable'
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

const SalesReport = ({ setLoading }) => {

  // const { listCustomers, listStores, listProducts, listSellers } = data;

  const { formState, onInputChange, fnSearchReport, fnExportToExcel, fnPrintReport, table, formStateTotals, onInputChangeTotals, listCustomers, listStores, listProducts, listSellers, totals } = useSalesReport({ setLoading });

  const { customerId, storeId, productCode, sellerId, startDate, endDate } = formState;

  const { qty, subtotal, discount, tax, total } = totals;


  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className='mb-3'>
            <CardBody>
              <Row>
                <Colxx xxs="12" md="8" xl="9">
                  <Row>
                    <Colxx xxs="12" xl="8">
                      <SearchSelect
                        label='select.customer'
                        name='customerId'
                        inputValue={customerId}
                        onChange={onInputChange}
                        options={listCustomers}
                      />
                    </Colxx>
                    <Colxx xxs="12" xl="4">
                      <SearchSelect
                        label='select.storeId'
                        name='storeId'
                        inputValue={storeId}
                        onChange={onInputChange}
                        options={listStores}
                      />
                    </Colxx>
                    <Colxx xxs="12" xl="7">
                      <SearchSelect
                        label='select.productId'
                        name='productCode'
                        inputValue={productCode}
                        onChange={onInputChange}
                        options={listProducts}
                      />
                    </Colxx>
                    <Colxx xxs="12" xl="5">
                      <SearchSelect
                        label='page.salesReport.select.sellerId'
                        name='sellerId'
                        inputValue={sellerId}
                        onChange={onInputChange}
                        options={listSellers}
                      />
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs="12" md="4" xl="3">
                  <Row>
                    <Colxx xxs="12" xs="6" md="12">
                      <DateCalendar
                        name="startDate"
                        label='select.dateStart'
                        value={startDate}
                        onChange={onInputChange}
                      />
                    </Colxx>
                    <Colxx xxs="12" xs="6" md="12">
                      <DateCalendar
                        name="endDate"
                        label='select.dateEnd'
                        value={endDate}
                        onChange={onInputChange}
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
              <Row className='mb-3'>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="primary" onClick={() => { fnSearchReport() }}>
                    <i className='bi bi-search' /> {IntlMessages("button.search")}
                  </Button>
                  <Button color="secondary" onClick={() => { fnExportToExcel() }}>
                    <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.exportXls")}
                  </Button>
                  {/* <Button color="info" onClick={() => { fnPrintReport() }}>
                    <i className='bi bi-printer' /> {IntlMessages("button.print")}
                  </Button> */}
                </Colxx>
              </Row>
            </CardBody>
          </Card>
          <Row>
            <Colxx xxs="12">
              <ReactTable {...table} />
            </Colxx>
          </Row>
          <Card className='mb-3 mt-3'>
            <CardBody>
              <Row>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                  <InputField
                    name="subtotal"
                    label='input.subtotal'
                    value={subtotal}
                    // onChange={onInputChangeTotals}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                  <InputField
                    name="discount"
                    label='input.discount'
                    value={discount}
                    // onChange={onInputChangeTotals}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                  <InputField
                    name="tax"
                    label='input.tax'
                    value={tax}
                    // onChange={onInputChangeTotals}
                    type="text"
                    disabled
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                  <InputField
                    name="total"
                    label='input.total'
                    value={total}
                    // onChange={onInputChangeTotals}
                    type="text"
                    disabled
                  />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      {/* <Modal {...propsToModalOtherReports} /> */}
    </>
  );
}
export default SalesReport;