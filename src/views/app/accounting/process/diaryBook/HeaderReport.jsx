import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

// La búsqueda de texto es la de la tabla (en el servidor). Solo Excel: este reporte no tiene PDF.
const HeaderReport = ({ dateStart, dateEnd, accountCode, listAccounts, errors = {}, sendForm = false, onInputChange, fnSearchReport, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="4">
          <DateCalendar
            name="dateStart"
            label="select.dateStart"
            value={dateStart}
            onChange={onInputChange}
            feedbackText={sendForm ? errors.dateStart : ''}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="4">
          <DateCalendar
            name="dateEnd"
            label="select.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
            feedbackText={sendForm ? errors.dateEnd : ''}
          />
        </Colxx>
        <Colxx xxs="12" md="12" lg="4">
          <SearchSelect
            label="page.diaryBook.input.accountCode"
            name="accountCode"
            inputValue={accountCode}
            options={listAccounts}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <Button color="primary" onClick={fnSearchReport}>
            <i className="bi bi-arrow-repeat" /> {IntlMessages('button.update')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
};

export default HeaderReport;
