import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ kind, mode, year, dateStart, dateEnd, level, levels, kinds, modes, onInputChange, fnSearch, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" xs="6" md="3">
          <SimpleSelect
            name="kind"
            label="page.accountingReports.input.kind"
            value={kind}
            onChange={onInputChange}
            options={kinds}
            getOptionValue={(o) => o.value}
            getOptionLabel={(o) => o.label}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3">
          <SimpleSelect
            name="mode"
            label="page.accountingReports.input.mode"
            value={mode}
            onChange={onInputChange}
            options={modes}
            getOptionValue={(o) => o.value}
            getOptionLabel={(o) => o.label}
          />
        </Colxx>
        {mode === 'range' ? (
          <>
            <Colxx xxs="12" xs="6" md="3">
              <DateCalendar name="dateStart" label="page.accountingReports.input.dateStart" value={dateStart} onChange={onInputChange} />
            </Colxx>
            <Colxx xxs="12" xs="6" md="3">
              <DateCalendar name="dateEnd" label="page.accountingReports.input.dateEnd" value={dateEnd} onChange={onInputChange} />
            </Colxx>
          </>
        ) : (
          <Colxx xxs="12" xs="6" md="3">
            <InputField name="year" label="page.accountingReports.input.year" value={year} onChange={onInputChange} type="number" />
          </Colxx>
        )}
        <Colxx xxs="12" md="4">
          <SimpleSelect
            name="level"
            label="page.accountingReports.input.level"
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
        </Colxx>
      </Row>
    </>
  );
};

export default HeaderReport;
