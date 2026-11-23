import { useIntl } from 'react-intl';
import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { SimpleSelect } from '@Components/simpleSelect';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { RadioGroup } from '@Components/radioGroup';
import { Checkbox } from '@Components/checkbox';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

// SPEC v2-110-sr: tipo de reporte, fechas (no en la Última compra), moneda (solo con facturación en Lempiras y Dólares) y los filtros propios de cada reporte: cliente con
// búsqueda en el servidor, facturador (los cajeros reales), "Solo afiliados", días mínimos, clasificaciones y comparación del promedio. Un filtro inválido se marca y no llama al
// back. Buscar, Exportar (Excel) e Imprimir (PDF).
const HeaderReport = ({
  formState, errors, sendForm, onInputChange, onReportTypeChange, currentConfig, reportOptions, avgOptions, downloading, hasDualCurrency, listCustomers, onCustomerSearch,
  listCashiers, productTypes, fnSearchReport, fnPrint, fnExport
}) => {
  const { reportType, startDate, endDate, currency, customerId, cashierId, isPartner, minDays, avgOp, avgValue, avgValue2 } = formState;
  const intl = useIntl();
  const has = (filter) => currentConfig.filters.includes(filter);
  const showAvgTwo = avgOp === 'between';
  return (
    <>
      <Row>
        <Colxx xxs="12" sm="6" lg="4">
          <SimpleSelect name="reportType" label="page.otherSalesReports.select.reportType" value={reportType} onChange={onReportTypeChange} options={reportOptions} />
        </Colxx>
        {!currentConfig.noDates && (
          <>
            <Colxx xxs="12" xs="6" sm="3" lg="2">
              <DateCalendar name="startDate" label="select.dateStart" value={startDate} onChange={onInputChange} feedbackText={sendForm ? errors.startDate : undefined} />
            </Colxx>
            <Colxx xxs="12" xs="6" sm="3" lg="2">
              <DateCalendar name="endDate" label="select.dateEnd" value={endDate} onChange={onInputChange} feedbackText={sendForm ? errors.endDate : undefined} />
            </Colxx>
          </>
        )}
        {currentConfig.hasCurrency && hasDualCurrency && (
          <Colxx xxs="12" sm="6" lg="3">
            <RadioGroup
              label="page.invoicing.title.currency"
              name="currency"
              value={currency}
              onChange={onInputChange}
              display="flex"
              options={[{ id: 1, label: 'page.invoicing.radio.lempira' }, { id: 2, label: 'page.invoicing.radio.dollar' }]}
            />
          </Colxx>
        )}
      </Row>
      <Row className="mb-2">
        {has('customerId') && (
          <Colxx xxs="12" sm="6" lg="4">
            <SearchSelect label="select.customer" name="customerId" inputValue={customerId} onChange={onInputChange} options={listCustomers} onInputChange={onCustomerSearch} />
          </Colxx>
        )}
        {has('cashierId') && (
          <Colxx xxs="12" sm="6" lg="4">
            <SearchSelect label="page.boxesReport.select.cashierId" name="cashierId" inputValue={cashierId} onChange={onInputChange} options={listCashiers} />
          </Colxx>
        )}
        {has('minDays') && (
          <Colxx xxs="12" xs="6" sm="3" lg="2">
            <InputField
              name="minDays"
              label="page.otherSalesReports.input.minDays"
              value={minDays}
              onChange={onInputChange}
              type="text"
              feedbackText={sendForm ? errors.minDays : undefined}
            />
          </Colxx>
        )}
        {has('isPartner') && (
          <Colxx xxs="12" sm="6" lg="3" className="d-flex align-items-center">
            <Checkbox label="page.otherSalesReports.check.isPartner" name="isPartner" value={isPartner} onChange={onInputChange} />
          </Colxx>
        )}
        {has('classification') && productTypes.length > 0 && (
          <Colxx xxs="12" lg="6">
            <div className="shadow-sm div-label-border">
              <span>{intl.formatMessage({ id: 'page.otherSalesReports.select.classification' })}</span>
              <div className="d-flex flex-wrap">
                {productTypes.map((item) => (
                  <div className="me-4 d-flex align-items-start" key={item.id}>
                    <Checkbox name={`type_${item.id}`} value={Number(formState[`type_${item.id}`]) === 1} onChange={onInputChange} />
                    <span className="ms-2">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Colxx>
        )}
        {has('average') && (
          <>
            <Colxx xxs="12" sm="6" lg="3">
              <SearchSelect label="page.otherSalesReports.select.avgOp" name="avgOp" inputValue={avgOp} onChange={onInputChange} options={avgOptions} />
            </Colxx>
            {avgOp !== '' && (
              <Colxx xxs="6" lg="2">
                <InputField name="avgValue" label="page.otherSalesReports.input.avgValue" value={avgValue} onChange={onInputChange} type="text" feedbackText={sendForm ? errors.avgValue : undefined} />
              </Colxx>
            )}
            {showAvgTwo && (
              <Colxx xxs="6" lg="2">
                <InputField name="avgValue2" label="page.otherSalesReports.input.avgValue2" value={avgValue2} onChange={onInputChange} type="text" feedbackText={sendForm ? errors.avgValue2 : undefined} />
              </Colxx>
            )}
          </>
        )}
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" disabled={downloading} onClick={() => { fnExport() }}>
            <i className='bi bi-file-earmark-excel' /> {IntlMessages('button.export')}
          </Button>
          <Button color="info" disabled={downloading} onClick={() => { fnPrint() }}>
            <i className='bi bi-printer' /> {IntlMessages('button.print')}
          </Button>
          <Button color="primary" onClick={() => { fnSearchReport() }}>
            <i className='bi bi-search' /> {IntlMessages('button.search')}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport
