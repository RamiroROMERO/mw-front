import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, customerId, customerTypeId, listCustomers, listCustomerTypes, onInputChange, fnSearch, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="4" lg="3">
          <DateCalendar
            name="date"
            label="page.cxcProjection.input.date"
            value={date}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="4" lg="4">
          <SearchSelect
            label="page.cxcProjection.input.customer"
            name="customerId"
            inputValue={customerId}
            options={listCustomers}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="4" lg="5">
          <SearchSelect
            label="page.cxcProjection.input.customerType"
            name="customerTypeId"
            inputValue={customerTypeId}
            options={listCustomerTypes}
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
