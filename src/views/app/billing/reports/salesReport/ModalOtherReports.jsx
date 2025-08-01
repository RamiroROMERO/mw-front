import React from 'react'
import { Button, Card, CardBody, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import useModalOtherReports from './useModalOtherReports'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import DateCalendar from '@/components/dateCalendar'
import ReactTable from '@/components/reactTable'
import { InputField } from '@/components/inputFields'

const ModalOtherReports = ({setOpen, data}) => {
  const {listCustomers, listStores, listProducts, listSellers} = data;

  const {formState, onInputChange, fnSearchReport, fnExportToExcel, fnPrintReport, table, formStateTotals, onInputChangeTotals} = useModalOtherReports({});

  const {customerId, storeId, productId, sellerId, dateStart, dateEnd} = formState;

  const {subtotal, discount, tax, total} = formStateTotals;

  return (
    <>
      <ModalBody>
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
                      name='productId'
                      inputValue={productId}
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
                      name="dateStart"
                      label='select.dateStart'
                      value={dateStart}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" md="12">
                    <DateCalendar
                      name="dateEnd"
                      label='select.dateEnd'
                      value={dateEnd}
                      onChange={onInputChange}
                    />
                  </Colxx>
                </Row>
              </Colxx>
            </Row>
            <Row className='mb-3'>
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="primary" onClick={() => {fnSearchReport()}}>
                  <i className='bi bi-search' /> {IntlMessages("button.search")}
                </Button>
                <Button color="secondary" onClick={() => {fnExportToExcel()}}>
                  <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.exportXls")}
                </Button>
                <Button color="info" onClick={() => {fnPrintReport()}}>
                  <i className='bi bi-printer' /> {IntlMessages("button.print")}
                </Button>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table}/>
          </Colxx>
        </Row>
        <Card className='mb-3'>
          <CardBody>
            <Row>
              <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                <InputField
                  name="subtotal"
                  label='input.subtotal'
                  value={subtotal}
                  onChange={onInputChangeTotals}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                <InputField
                  name="discount"
                  label='input.discount'
                  value={discount}
                  onChange={onInputChangeTotals}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                <InputField
                  name="tax"
                  label='input.tax'
                  value={tax}
                  onChange={onInputChangeTotals}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2">
                <InputField
                  name="total"
                  label='input.total'
                  value={total}
                  onChange={onInputChangeTotals}
                  type="text"
                  disabled
                />
              </Colxx>
            </Row>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}}>
          <i className="bi bi-box-arrow-right"/> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalOtherReports