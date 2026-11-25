import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ mode, modeOptions, onModeChange, year, month, monthEnd, months, summaryOnly, onInputChange, fnSearch, fnPrint, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="4">
          <RadioGroup
            name="mode"
            value={mode}
            onChange={onModeChange}
            options={modeOptions}
            display="flex"
          />
        </Colxx>
        <Colxx xxs="6" md="2">
          <SimpleSelect
            name="month"
            label={mode === 'range' ? 'page.budgetExecution.input.monthStart' : 'page.budgetExecution.input.month'}
            value={month}
            onChange={onInputChange}
            options={months}
            getOptionValue={(o) => o.value}
            getOptionLabel={(o) => o.label}
          />
        </Colxx>
        {mode === 'range' && (
          <Colxx xxs="6" md="2">
            <SimpleSelect
              name="monthEnd"
              label="page.budgetExecution.input.monthEnd"
              value={monthEnd}
              onChange={onInputChange}
              options={months}
              getOptionValue={(o) => o.value}
              getOptionLabel={(o) => o.label}
            />
          </Colxx>
        )}
        <Colxx xxs="6" md="2">
          <InputField
            name="year"
            label="page.budgetExecution.input.year"
            type="text"
            value={year}
            onChange={onInputChange}
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
              {IntlMessages('page.budgetExecution.input.summaryOnly')}
            </label>
          </span>
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages('button.print')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
