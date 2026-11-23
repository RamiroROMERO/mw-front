import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { RadioGroup } from '@Components/radioGroup';
import { Checkbox } from '@Components/checkbox';
import { IntlMessages } from '@Helpers/Utils';

// SPEC v2-104-sr: vendedor, fechas, moneda (solo con facturación en Lempiras y Dólares) y "Solo mayoristas" (aplica a Clientes nuevos); un rango inválido se marca y no llama al
// back. Buscar (detalle), Resumen y Clientes nuevos (modales), Exportar (Excel) e Imprimir (PDF) del detalle.
const HeaderReport = ({
  formState, errors, sendForm, onInputChange, listSellers, downloading, hasDualCurrency, fnSearchReport, fnViewSummary, fnViewNewCustomers, fnPrint, fnExport
}) => {
  const { sellerCode, startDate, endDate, currency, partnersOnly } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" md="8" xl="9">
          <Row>
            <Colxx xxs="12" xl="6">
              <SearchSelect
                label='page.salesReport.select.sellerId'
                name='sellerCode'
                inputValue={sellerCode}
                onChange={onInputChange}
                options={listSellers}
              />
            </Colxx>
            {hasDualCurrency && (
              <Colxx xxs="12" xs="6" xl="3">
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
            <Colxx xxs="12" xs="6" xl="3" className="d-flex align-items-center">
              <Checkbox
                label="page.salesBySeller.check.partnersOnly"
                name="partnersOnly"
                value={partnersOnly}
                onChange={onInputChange}
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
          </Row>
        </Colxx>
      </Row>
      <Row className='mb-3'>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" disabled={downloading} onClick={() => { fnExport() }}>
            <i className='bi bi-file-earmark-excel' /> {IntlMessages("button.export")}
          </Button>
          <Button color="dark" disabled={downloading} onClick={() => { fnPrint() }}>
            <i className='bi bi-printer' /> {IntlMessages("button.print")}
          </Button>
          <Button color="info" onClick={() => { fnViewNewCustomers() }}>
            <i className='bi bi-person' /> {IntlMessages("button.newCustomers")}
          </Button>
          <Button color="secondary" onClick={() => { fnViewSummary() }}>
            <i className='bi bi-list' /> {IntlMessages("button.summary")}
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
