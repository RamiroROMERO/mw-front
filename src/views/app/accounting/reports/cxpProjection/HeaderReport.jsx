import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, providerId, listProviders, onInputChange, fnSearch, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="4" lg="3">
          <DateCalendar
            name="date"
            label="page.cxpProjection.input.date"
            value={date}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="8" lg="9">
          <SearchSelect
            label="page.cxpProjection.input.provider"
            name="providerId"
            inputValue={providerId}
            options={listProviders}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-search" /> {IntlMessages('button.search')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
