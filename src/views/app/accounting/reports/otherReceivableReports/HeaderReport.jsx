import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { SimpleSelect } from '@Components/simpleSelect';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ date, currency, hasDualCurrency, customerTypeId, customerId, expiry, expiryOptions, listCustomerTypes, listCustomers, onInputChange, fnSearch, fnPrint, fnExportXlsx }) => {
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
        {hasDualCurrency && (
          <Colxx xxs="12" md="4" lg="2">
            <RadioGroup
              label="page.invoicing.title.currency"
              name="currency"
              value={currency}
              onChange={onInputChange}
              options={[{ id: 1, label: 'page.invoicing.radio.lempira' }, { id: 2, label: 'page.invoicing.radio.dollar' }]}
            />
          </Colxx>
        )}
        <Colxx xxs="12" md="4" lg="3">
          <SearchSelect
            label="page.otherReceivableReports.input.customerType"
            name="customerTypeId"
            inputValue={customerTypeId}
            options={listCustomerTypes}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="4">
          <SearchSelect
            label="page.otherReceivableReports.input.customer"
            name="customerId"
            inputValue={customerId}
            options={listCustomers}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="3">
          <SimpleSelect
            name="expiry"
            label="page.otherReceivableReports.input.expiry"
            value={expiry}
            onChange={onInputChange}
            options={expiryOptions}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-search" /> {IntlMessages('button.search')}
          </Button>
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages('button.print')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
