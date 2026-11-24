import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';

// La moneda solo se muestra si la empresa factura en Lempiras y Dólares (`hasDualCurrency`).
const HeaderReport = ({ date, currency, hasDualCurrency, onInputChange, fnSearch, fnExportXlsx }) => {
  return (
    <Row>
      <Colxx xxs="12" md="4" lg="3">
        <DateCalendar
          name="date"
          label="page.cxcWeekly.input.date"
          value={date}
          onChange={onInputChange}
        />
      </Colxx>
      {hasDualCurrency && (
        <Colxx xxs="12" md="4" lg="3">
          <RadioGroup
            label="page.invoicing.title.currency"
            name="currency"
            value={currency}
            onChange={onInputChange}
            options={[{ id: 1, label: 'page.invoicing.radio.lempira' }, { id: 2, label: 'page.invoicing.radio.dollar' }]}
          />
        </Colxx>
      )}
      <Colxx xxs="12" md="4" lg="6" className="div-action-button-container align-items-end">
        <Button color="secondary" onClick={fnExportXlsx}>
          <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
        </Button>
        <Button color="primary" onClick={fnSearch}>
          <i className="bi bi-search" /> {IntlMessages('button.search')}
        </Button>
      </Colxx>
    </Row>
  );
};

export default HeaderReport;
