import { Button, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { IntlMessages } from '@Helpers/Utils'
import { RadioGroup } from '@Components/radioGroup'

// SPEC v2-98-sr: clientes y productos con búsqueda en el servidor; el vendedor viaja por su código (`vend_code`); un rango inválido se marca y no llama al back.
const HeaderReport = ({
  formState, errors, sendForm, onInputChange, listCustomers, listSellers, listStores, listProducts, onCustomerSearch, onProductSearch,
  downloading, fnSearchReport, fnExport, fnSummary
}) => {
  const { customerId, storeId, productCode, sellerCode, documentType, startDate, endDate } = formState;
  return (
    <>
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
                onInputChange={onCustomerSearch}
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
                onInputChange={onProductSearch}
              />
            </Colxx>
            <Colxx xxs="12" xl="5">
              <SearchSelect
                label='page.salesReport.select.sellerId'
                name='sellerCode'
                inputValue={sellerCode}
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
                feedbackText={sendForm ? errors.startDate : undefined}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" md="12">
              <DateCalendar
                name="endDate"
                label='select.dateEnd'
                value={endDate}
                onChange={onInputChange}
                feedbackText={sendForm ? errors.endDate : undefined}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="12">
              <RadioGroup
                label="page.invoicing.title.salesType"
                name="documentType"
                value={documentType}
                onChange={onInputChange}
                options={
                  [
                    { id: 1, label: "page.invoicing.radio.cash" },
                    { id: 2, label: "page.invoicing.radio.credit" },
                    { id: 3, label: "radio.all" }
                  ]
                }
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" disabled={downloading} onClick={() => { fnExport() }}>
            <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.export")}
          </Button>
          <Button color="info" onClick={() => { fnSummary() }}>
            <i className='bi bi-list-task' /> {IntlMessages("button.summary")}
          </Button>
          <Button color="primary" onClick={() => { fnSearchReport() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport
