import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ dateStart, dateEnd, accountCode, search, listAccounts, onInputChange, onSearchChange, fnSearchReport, fnPrint, fnExportXlsx }) => {
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
          <SearchSelect
            label="page.diaryBook.input.accountCode"
            name="accountCode"
            inputValue={accountCode}
            options={listAccounts}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <InputField
            name="search"
            label="page.diaryBook.input.search"
            value={search}
            onChange={onSearchChange}
            type="text"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages("button.print")}
          </Button>
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages("button.exportXls")}
          </Button>
          <Button color="primary" onClick={fnSearchReport}>
            <i className="bi bi-arrow-repeat" /> {IntlMessages("button.update")}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
