import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';
import { RadioGroup } from '@Components/radioGroup';

// SPEC v2-100-sr: cliente con búsqueda en el servidor, tipo de venta, moneda y fechas; un rango inválido se marca y no llama al back. Imprimir (PDF) y Exportar (Excel).
const HeaderReport = ({ formState, errors, sendForm, onInputChange, listCustomers, onCustomerSearch, downloading, hasDualCurrency, fnSearchReport, fnPrint, fnExport }) => {
  const { customerId, startDate, endDate, typeDocto, currency } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" md="8" xl="9">
          <Row>
            <Colxx xxs="12" lg="6">
              <SearchSelect
                label='select.customer'
                name='customerId'
                inputValue={customerId}
                onChange={onInputChange}
                options={listCustomers}
                onInputChange={onCustomerSearch}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" lg="3">
              <RadioGroup
                label="page.invoicing.title.salesType"
                name="typeDocto"
                value={typeDocto}
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
            {hasDualCurrency && (
              <Colxx xxs="12" xs="6" lg="3">
                <RadioGroup
                  label="page.invoicing.title.currency"
                  name="currency"
                  value={currency}
                  onChange={onInputChange}
                  options={
                    [
                      { id: 1, label: "page.invoicing.radio.lempira" },
                      { id: 2, label: "page.invoicing.radio.dollar" }
                    ]
                  }
                />
              </Colxx>
            )}
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
          </Row>
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" disabled={downloading} onClick={() => { fnExport() }}>
            <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.export")}
          </Button>
          <Button color="info" disabled={downloading} onClick={() => { fnPrint() }}>
            <i className='bi bi-printer' /> {IntlMessages("button.print")}
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
