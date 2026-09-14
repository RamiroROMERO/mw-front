import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Row } from 'reactstrap';
import DateCalendar from '@Components/dateCalendar';
import { SimpleSelect } from '@Components/simpleSelect';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { RadioGroup } from '@Components/radioGroup';
import { Checkbox } from '@Components/checkbox';
import { IntlMessages } from '@Helpers/Utils';
import { REPORT_TYPES } from './reportConfig';

const HeaderReport = ({ formState, onInputChange, onReportTypeChange, listCustomers, listCashiers, currentConfig, fnSearchReport }) => {
  const { reportType, startDate, endDate, currency, customerId, cashierId, isPartner } = formState;

  const reportOptions = REPORT_TYPES.map((item) => ({ id: item.key, code: item.key, name: IntlMessages(item.label) }));

  return (
    <>
      <Row>
        <Colxx xxs="12" sm="6" lg="4">
          <SimpleSelect
            name="reportType"
            label="page.otherSalesReports.select.reportType"
            value={reportType}
            onChange={onReportTypeChange}
            options={reportOptions}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3" lg="2">
          <DateCalendar name="startDate" label="select.dateStart" value={startDate} onChange={onInputChange} />
        </Colxx>
        <Colxx xxs="12" xs="6" sm="3" lg="2">
          <DateCalendar name="endDate" label="select.dateEnd" value={endDate} onChange={onInputChange} />
        </Colxx>
        {currentConfig.hasCurrency && (
          <Colxx xxs="12" sm="6" lg="2">
            <RadioGroup
              label="page.invoicing.title.currency"
              name="currency"
              value={currency}
              onChange={onInputChange}
              display="flex"
              options={[
                { id: 1, label: 'page.invoicing.radio.lempira' },
                { id: 2, label: 'page.invoicing.radio.dollar' }
              ]}
            />
          </Colxx>
        )}
      </Row>
      <Row className="mb-2">
        {currentConfig.filters.includes('customerId') && (
          <Colxx xxs="12" sm="6" lg="3">
            <SearchSelect
              label="page.custCreditNotes.select.clientId"
              name="customerId"
              inputValue={customerId}
              onChange={onInputChange}
              options={listCustomers}
            />
          </Colxx>
        )}
        {currentConfig.filters.includes('cashierId') && (
          <Colxx xxs="12" sm="6" lg="3">
            <SearchSelect
              label="page.boxesReport.select.cashierId"
              name="cashierId"
              inputValue={cashierId}
              onChange={onInputChange}
              options={listCashiers}
            />
          </Colxx>
        )}
        {currentConfig.filters.includes('isPartner') && (
          <Colxx xxs="12" sm="6" lg="3" className="d-flex align-items-center">
            <Checkbox
              label="page.otherSalesReports.check.isPartner"
              name="isPartner"
              value={isPartner}
              onChange={onInputChange}
            />
          </Colxx>
        )}
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={() => { fnSearchReport() }}>
            <i className='bi bi-search' /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport
