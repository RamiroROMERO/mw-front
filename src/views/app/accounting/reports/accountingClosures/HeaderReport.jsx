import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, onInputChange, fnAskExecute, fnPreviewIncomeStatement, fnOpenSettings }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="4" lg="3">
          <DateCalendar
            name="date"
            label="page.accountingClosures.input.date"
            value={date}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnOpenSettings}>
            <i className="bi bi-gear-fill" /> {IntlMessages('page.accountingClosures.button.settings')}
          </Button>
          <Button color="info" onClick={fnPreviewIncomeStatement}>
            <i className="bi bi-eye-fill" /> {IntlMessages('page.accountingClosures.button.preview')}
          </Button>
          <Button color="danger" onClick={fnAskExecute}>
            <i className="bi bi-play-fill" /> {IntlMessages('page.accountingClosures.button.execute')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
