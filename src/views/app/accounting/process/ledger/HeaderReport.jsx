import Select from 'react-select';
import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputLabel } from '@Components/inputLabel/InputLabel';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ mode, modeOptions, onModeChange, dateStart, dateEnd, accountCode, listAccounts, onInputChange, onMultiAccountsChange, fnSearch, fnPrint, fnExportXlsx }) => {
  const selectPlaceholder = IntlMessages("msg.select");
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="3">
          <DateCalendar
            name="dateStart"
            label="select.dateStart"
            value={dateStart}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <DateCalendar
            name="dateEnd"
            label="select.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <RadioGroup
            name="mode"
            value={mode}
            onChange={onModeChange}
            options={modeOptions}
            display="flex"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" md="8">
          {mode === 'single' ? (
            <SearchSelect
              label="page.ledger.input.accountCode"
              name="accountCode"
              inputValue={accountCode}
              options={listAccounts}
              onChange={onInputChange}
            />
          ) : (
            <InputLabel label="page.ledger.input.accountCodes">
              <Select
                className="react-select"
                classNamePrefix="react-select"
                isMulti
                options={listAccounts}
                onChange={onMultiAccountsChange}
                placeholder={selectPlaceholder}
              />
            </InputLabel>
          )}
        </Colxx>
        <Colxx xxs="12" md="4" className="div-action-button-container align-items-end">
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages("button.print")}
          </Button>
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages("button.exportXls")}
          </Button>
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-search" /> {IntlMessages("button.search")}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
