import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ type, typeOptions, dateStart, dateEnd, search, error, onInputChange, onTypeChange, fnSearchReport, fnExportExcel, fnPrint }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-2">
          <RadioGroup name="type" value={type} onChange={onTypeChange} display="flex" options={typeOptions} />
        </Colxx>
      </Row>
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
          <InputField
            name="search"
            label="page.honorariosReport.input.search"
            value={search}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
      </Row>
      {error && (
        <Row>
          <Colxx xxs="12" className="text-danger mb-2">{IntlMessages(error)}</Colxx>
        </Row>
      )}
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnPrint}>
            <i className="bi bi-printer" /> {IntlMessages("button.print")}
          </Button>
          <Button color="secondary" onClick={fnExportExcel}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages("button.export")}
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
