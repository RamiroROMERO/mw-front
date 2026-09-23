import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ dateStart, dateEnd, cai, search, listDocuments, onInputChange, onSearchChange, fnSearchReport, fnPrint, fnExportDeclaration, fnExportSalesBook }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="4">
          <SearchSelect
            label="page.taxSalesReport.select.documentType"
            name="cai"
            inputValue={cai}
            options={listDocuments}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="2">
          <DateCalendar
            name="dateStart"
            label="select.dateStart"
            value={dateStart}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="2">
          <DateCalendar
            name="dateEnd"
            label="select.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="4">
          <InputField
            name="search"
            label="page.taxPurchaseReport.input.search"
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
          <Button color="secondary" onClick={fnExportDeclaration}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages("page.taxSalesReport.button.exportDeclaration")}
          </Button>
          <Button color="secondary" onClick={fnExportSalesBook}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages("page.taxSalesReport.button.exportSalesBook")}
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
