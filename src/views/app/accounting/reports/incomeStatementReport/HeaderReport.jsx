import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({
  dateStart, dateEnd, level, levels, summaryOnly, onInputChange,
  fnSearch, fnPrint, fnExportXlsx, fnExportAnnualIncome, fnExportAnnualExpenses
}) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" xs="6" md="3">
          <DateCalendar
            name="dateStart"
            label="page.incomeStatementReport.input.dateStart"
            value={dateStart}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3">
          <DateCalendar
            name="dateEnd"
            label="page.incomeStatementReport.input.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="4">
          <SimpleSelect
            name="level"
            label="page.incomeStatementReport.input.level"
            value={level}
            onChange={onInputChange}
            options={levels}
            getOptionValue={(o) => o.value}
            getOptionLabel={(o) => o.label}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-search" /> {IntlMessages('button.search')}
          </Button>
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <span className="form-check ms-2 me-1 d-inline-flex align-items-center">
            <input
              className="form-check-input me-1"
              type="checkbox"
              name="summaryOnly"
              id="summaryOnly"
              checked={summaryOnly}
              onChange={onInputChange}
            />
            <label className="form-check-label" htmlFor="summaryOnly">
              {IntlMessages('page.incomeStatementReport.input.summaryOnly')}
            </label>
          </span>
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages('button.print')}
          </Button>
          <Button color="info" onClick={fnExportAnnualIncome}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('page.incomeStatementReport.button.annualIncome')}
          </Button>
          <Button color="info" onClick={fnExportAnnualExpenses}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('page.incomeStatementReport.button.annualExpenses')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
