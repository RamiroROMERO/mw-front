import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, search, onInputChange, onSearchChange, fnSearch, fnPrint, fnExportXlsx, fnOpenReports }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="3">
          <DateCalendar
            name="date"
            label="page.accountsToPay.input.date"
            value={date}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <InputField
            name="search"
            label="page.accountsToPay.input.search"
            value={search}
            onChange={onSearchChange}
            type="text"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages('button.print')}
          </Button>
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <Button color="secondary" onClick={fnOpenReports}>
            <i className="bi bi-file-earmark-bar-graph" /> {IntlMessages('page.accountsToPay.button.reports')}
          </Button>
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-arrow-repeat" /> {IntlMessages('button.update')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
