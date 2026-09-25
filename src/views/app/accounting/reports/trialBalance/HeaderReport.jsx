import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({
  dateStart, dateEnd, level, levels, onInputChange,
  fnSearch, fnPrint, fnExportXlsx, fnExportAnnualIntegrated
}) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" xs="6" md="3">
          <DateCalendar
            name="dateStart"
            label="page.trialBalance.input.dateStart"
            value={dateStart}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3">
          <DateCalendar
            name="dateEnd"
            label="page.trialBalance.input.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="4">
          <SimpleSelect
            name="level"
            label="page.trialBalance.input.level"
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
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages('button.print')}
          </Button>
          <Button color="info" onClick={fnExportAnnualIntegrated}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('page.trialBalance.button.annualIntegrated')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
