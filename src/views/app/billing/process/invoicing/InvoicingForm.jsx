import { Row, Form } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { RadioGroup } from '@Components/radioGroup';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { SimpleSelect } from '@Components/simpleSelect';
import { Checkbox } from '@Components/checkbox';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar'

const InvoicingForm = (props) => {
  const { documentCode, customerId, notes, documentType, currency, printType, date, dateInProcess, areaId, cashierId, storeId, documentExo, documentId, numcai, listTypeDocuments, listCustomers, listAreas, listWarehouse, listSellers, handleAreaChange, handleExemptChange, onInputChangeIndex, formValidationIndex, sendFormIndex, setBulkFormIndex, onInputDetaChange, hasSellerControl } = props;

  const { documentCodeValid, customerIdValid, documentTypeValid, currencyValid } = formValidationIndex;

  const onCustomerChange = e => {
    const idCust = e.target.value;

    const filterCustomer = listCustomers.find((item) => {
      return item.id === idCust;
    });

    setBulkFormIndex({ customerId: idCust, customerDNI: filterCustomer ? filterCustomer.rtn : '', customerName: filterCustomer ? filterCustomer.name : '' });
  }

  return (
    <>
      <Form>
        <Row>
          <Colxx xxs="12" xs="12" sm="8" md="8" lg="5">
            <Row>
              <Colxx xxs="12">
                <SimpleSelect
                  name="documentCode"
                  label="page.invoicing.select.typeDocument"
                  value={documentCode}
                  onChange={onInputChangeIndex}
                  options={listTypeDocuments}
                  invalid={sendFormIndex && !!documentCodeValid}
                  feedbackText={sendFormIndex && (documentCodeValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="4">
                <InputField
                  value={documentId || ''}
                  name="documentId"
                  type="text"
                  disabled
                  label="page.invoicing.input.internalNumber"
                  style={{ resize: 'none', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)', fontSize: '1rem' }}
                />
              </Colxx>
              <Colxx xxs="8">
                <InputField
                  value={numcai}
                  name="numcai"
                  type="text"
                  disabled
                  label="page.invoicing.input.fiscalNumber"
                  style={{ resize: 'none', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)', fontSize: '1rem' }}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <ContainerWithLabel label="page.invoicing.title.customer">
                  <SearchSelect
                    label='page.invoicing.select.customerId'
                    name='customerId'
                    inputValue={customerId}
                    onChange={onCustomerChange}
                    options={listCustomers}
                    invalid={sendFormIndex && !!customerIdValid}
                    feedbackText={sendFormIndex && (customerIdValid || null)}
                  />
                  <InputField
                    value={notes}
                    name="notes"
                    onChange={onInputChangeIndex}
                    type="text"
                    label="page.invoicing.input.reference"
                  />
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" xs="12" sm="4" md="4" lg="3">
            <Row>
              <Colxx xxs="12" xs="6" sm="12">
                <RadioGroup
                  label="page.invoicing.title.salesType"
                  name="documentType"
                  value={documentType}
                  onChange={onInputChangeIndex}
                  options={
                    [
                      { id: 1, label: "page.invoicing.radio.cash" },
                      { id: 2, label: "page.invoicing.radio.credit" }
                    ]
                  }
                  invalid={sendFormIndex && !!documentTypeValid}
                  feedbackText={sendFormIndex && (documentTypeValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xs="6" sm="12" style={{ display: printType !== undefined ? 'none' : 'block' }}>
                <RadioGroup
                  label="page.invoicing.title.currency"
                  name="currency"
                  value={currency}
                  onChange={onInputChangeIndex}
                  options={
                    [
                      { id: 1, label: "page.invoicing.radio.lempira" },
                      { id: 2, label: "page.invoicing.radio.dollar" }
                    ]
                  }
                  invalid={sendFormIndex && !!currencyValid}
                  feedbackText={sendFormIndex && (currencyValid || null)}
                />
              </Colxx>
              <Colxx xxs="12" xs="6" sm="12" style={{ display: printType !== undefined ? 'block' : 'none' }}>
                <RadioGroup
                  label="page.invoicing.title.printType"
                  name="printType"
                  value={printType}
                  onChange={onInputChangeIndex}
                  options={
                    [
                      { id: 1, label: "page.invoicing.radio.ticket" },
                      { id: 3, label: "page.invoicing.radio.letter" }
                    ]
                  }
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs="12">
                <Checkbox
                  label="page.invoicing.check.exemptInvoice"
                  name="documentExo"
                  value={documentExo}
                  onChange={handleExemptChange}
                />
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
            <Row>
              <Colxx xxs="12" sm="6" md="6" lg="6">
                <DateCalendar
                  value={dateInProcess}
                  disabled
                  name="dateInProcess"
                  label="page.invoicing.input.dateInProcess"
                  onChange={onInputChangeIndex}
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="6" lg="6">
                <DateCalendar
                  value={date}
                  disabled
                  name="date"
                  label="page.invoicing.input.dateDocument"
                  onChange={onInputChangeIndex}
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="6" lg="12">
                <SimpleSelect
                  name="areaId"
                  label="page.invoicing.select.areaId"
                  value={areaId}
                  onChange={handleAreaChange}
                  options={listAreas}
                />
              </Colxx>
              <Colxx xxs="12" sm="6" md="6" lg="12">
                <SimpleSelect
                  name="storeId"
                  label="page.invoicing.select.warehouseId"
                  value={storeId}
                  onChange={onInputDetaChange}
                  options={listWarehouse}
                />
              </Colxx>
              {hasSellerControl && (
                <Colxx xxs="12" sm="6" md="6" lg="12">
                  <SearchSelect
                    label='page.invoicing.select.sellerId'
                    name='cashierId'
                    inputValue={cashierId}
                    onChange={onInputChangeIndex}
                    options={listSellers}
                  />
                </Colxx>
              )}
            </Row>
          </Colxx>
        </Row>
      </Form>
    </>
  )
}
export default InvoicingForm;