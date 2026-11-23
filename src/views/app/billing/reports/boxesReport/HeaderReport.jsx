import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';
import { GROUP_NONE, GROUP_CASHIER, GROUP_PAYMENT_TYPE } from './cashReportRules';

// SPEC v2-108-sr: caja, cajero (los cajeros reales, no los vendedores), forma de pago, fechas y agrupación de los cobros; un rango inválido se marca y no llama al back.
// Buscar (cobros), Resumen, Cierres y Propinas (modales), Exportar (Excel) e Imprimir (PDF) de los cobros.
const HeaderReport = ({
  formState, errors, sendForm, onInputChange, filters, downloading, fnSearchReport, fnViewSummary, fnViewCashClose, fnViewTips, fnPrint, fnExport
}) => {
  const { startDate, endDate, cashierId, cashId, paymentTypeId, groupBy } = formState;
  return (
    <>
      <Row>
        <Colxx xxs="12" sm="7" xl="6">
          <Row>
            <Colxx xxs="12">
              <SearchSelect label='select.cashId' name='cashId' inputValue={cashId} onChange={onInputChange} options={filters.cashes} />
            </Colxx>
            <Colxx xxs="12">
              <SearchSelect label='page.boxesReport.select.cashierId' name='cashierId' inputValue={cashierId} onChange={onInputChange} options={filters.cashiers} />
            </Colxx>
            <Colxx xxs="12">
              <SearchSelect label='select.paymentMethod' name='paymentTypeId' inputValue={paymentTypeId} onChange={onInputChange} options={filters.paymentTypes} />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx xxs="12" sm="5" xl="6">
          <Row>
            <Colxx xxs="12" xs="6" sm="12" lg="6">
              <DateCalendar
                name="startDate"
                label='select.dateStart'
                value={startDate}
                onChange={onInputChange}
                feedbackText={sendForm ? errors.startDate : undefined}
              />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="12" lg="6">
              <DateCalendar
                name="endDate"
                label='select.dateEnd'
                value={endDate}
                onChange={onInputChange}
                feedbackText={sendForm ? errors.endDate : undefined}
              />
            </Colxx>
            <Colxx xxs="12">
              <RadioGroup
                label="page.boxesReport.radio.groupBy"
                name="groupBy"
                value={groupBy}
                onChange={onInputChange}
                options={
                  [
                    { id: GROUP_NONE, label: "page.boxesReport.radio.groupNone" },
                    { id: GROUP_CASHIER, label: "page.boxesReport.radio.groupCashier" },
                    { id: GROUP_PAYMENT_TYPE, label: "page.boxesReport.radio.groupPaymentType" }
                  ]
                }
              />
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row>
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
          <Button color="secondary" onClick={() => { fnViewSummary() }}>
            <i className='bi bi-list' /> {IntlMessages("button.summary")}
          </Button>
          <Button color="secondary" onClick={() => { fnViewCashClose() }}>
            <i className='bi bi-journal-check' /> {IntlMessages("page.boxesReport.button.cashClose")}
          </Button>
          <Button color="secondary" onClick={() => { fnViewTips() }}>
            <i className='bi bi-cash-coin' /> {IntlMessages("page.boxesReport.button.tips")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport
