import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ documentCode, customerId, listCustomers, onInputChange, fnSearch, fnLoadCustomers }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="4">
          <InputField
            name="documentCode"
            label="page.cxcInvoiceTrace.input.documentCode"
            value={documentCode}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="4">
          <SearchSelect
            label="page.cxcInvoiceTrace.input.customer"
            name="customerId"
            inputValue={customerId}
            options={listCustomers}
            onChange={onInputChange}
            onMenuOpen={fnLoadCustomers}
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
