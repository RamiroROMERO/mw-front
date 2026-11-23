import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { RadioGroup } from '@Components/radioGroup';
import { Checkbox } from '@Components/checkbox';
import { IntlMessages } from '@Helpers/Utils';

// SPEC v2-106-sr: año (selector, por defecto el actual), cliente con búsqueda en el servidor, "Sin impuesto" y moneda (solo con facturación en Lempiras y Dólares). Un año inválido
// se marca y no llama al back. Imprimir (PDF) y Exportar (Excel).
const HeaderReport = ({
  formState, errors, sendForm, onInputChange, listCustomers, onCustomerSearch, listYears, downloading, hasDualCurrency, fnSearchReport, fnPrint, fnExport
}) => {
  const { year, customerId, withoutTax, currency } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" md="4" xl="2">
          <SearchSelect
            label='input.noYear'
            name='year'
            inputValue={year}
            onChange={onInputChange}
            options={listYears}
            feedbackText={sendForm ? errors.year : undefined}
          />
        </Colxx>
        <Colxx xxs="12" md="8" xl="5">
          <SearchSelect
            label='select.customer'
            name='customerId'
            inputValue={customerId}
            onChange={onInputChange}
            options={listCustomers}
            onInputChange={onCustomerSearch}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="6" xl="2" className="d-flex align-items-center">
          <Checkbox
            label="page.monthlySalesCustomer.check.withoutTax"
            name="withoutTax"
            value={withoutTax}
            onChange={onInputChange}
          />
        </Colxx>
        {hasDualCurrency && (
          <Colxx xxs="12" xs="6" md="6" xl="3">
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
