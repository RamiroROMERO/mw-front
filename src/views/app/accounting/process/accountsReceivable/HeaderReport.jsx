import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';

// La fecha es la de corte (el saldo cuenta los pagos y notas solo hasta ella). La moneda solo se muestra si la empresa factura en Lempiras y Dólares (`hasDualCurrency`): por defecto, Lempiras.
const HeaderReport = ({ date, customerTypeId, search, currency, hasDualCurrency, listCustomerTypes, errors = {}, sendForm = false, onInputChange, onSearchChange, fnSearch, fnPrint, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="3">
          <DateCalendar
            name="date"
            label="page.accountsReceivable.input.date"
            value={date}
            onChange={onInputChange}
            feedbackText={sendForm ? errors.date : undefined}
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
        {hasDualCurrency && (
          <Colxx xxs="12" md="6" lg="3">
            <RadioGroup
              label="page.invoicing.title.currency"
              name="currency"
              value={currency}
              onChange={onInputChange}
              options={[
                { id: 1, label: 'page.invoicing.radio.lempira' },
                { id: 2, label: 'page.invoicing.radio.dollar' }
              ]}
            />
          </Colxx>
        )}
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
};

export default HeaderReport;
