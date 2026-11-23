import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { RadioGroup } from '@Components/radioGroup';

// SPEC v2-102-sr: fechas, tipo de producto (todos, productos o servicios) y moneda (solo con facturación en Lempiras y Dólares); un rango inválido se marca y no llama
// al back. Imprimir (PDF) y Exportar (Excel).
const HeaderReport = ({ formState, errors, sendForm, onInputChange, downloading, hasDualCurrency, fnSearchReport, fnPrint, fnExport }) => {
  const { startDate, endDate, itemType, currency } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" xs="6" md="3">
          <DateCalendar
            name="startDate"
            label='select.dateStart'
            value={startDate}
            onChange={onInputChange}
            feedbackText={sendForm ? errors.startDate : undefined}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3">
          <DateCalendar
            name="endDate"
            label='select.dateEnd'
            value={endDate}
            onChange={onInputChange}
            feedbackText={sendForm ? errors.endDate : undefined}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3">
          <RadioGroup
            label="page.summaryByProduct.title.itemType"
            name="itemType"
            value={itemType}
            onChange={onInputChange}
            options={
              [
                { id: 0, label: "radio.all" },
                { id: 1, label: "page.summaryByProduct.radio.products" },
                { id: 2, label: "page.summaryByProduct.radio.services" }
              ]
            }
          />
        </Colxx>
        {hasDualCurrency && (
          <Colxx xxs="12" xs="6" md="3">
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
