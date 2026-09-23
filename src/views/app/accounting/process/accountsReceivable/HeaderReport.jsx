import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, customerTypeId, search, listCustomerTypes, onInputChange, onSearchChange, fnSearch, fnPrint, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="3">
          <DateCalendar
            name="date"
            label="page.accountsReceivable.input.date"
            value={date}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <SearchSelect
            label="page.accountsReceivable.input.customerType"
            name="customerTypeId"
            inputValue={customerTypeId}
            options={listCustomerTypes}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <InputField
            name="search"
            label="page.accountsReceivable.input.search"
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
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-arrow-repeat" /> {IntlMessages('button.update')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
