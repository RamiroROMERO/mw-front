import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, customerTypeId, customerId, listCustomerTypes, listCustomers, onInputChange, fnSearch }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="4" lg="3">
          <DateCalendar
            name="date"
            label="page.otherReceivableReports.input.date"
            value={date}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="4" lg="4">
          <SearchSelect
            label="page.otherReceivableReports.input.customerType"
            name="customerTypeId"
            inputValue={customerTypeId}
            options={listCustomerTypes}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="4" lg="5">
          <SearchSelect
            label="page.otherReceivableReports.input.customer"
            name="customerId"
            inputValue={customerId}
            options={listCustomers}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-search" /> {IntlMessages('button.search')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
