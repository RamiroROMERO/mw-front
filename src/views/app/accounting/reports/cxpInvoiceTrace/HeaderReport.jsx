import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ documentCode, providerId, listProviders, onInputChange, fnSearch, fnLoadProviders }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="4">
          <InputField
            name="documentCode"
            label="page.cxpInvoiceTrace.input.documentCode"
            value={documentCode}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
        <Colxx xxs="12" md="6" lg="4">
          <SearchSelect
            label="page.cxpInvoiceTrace.input.provider"
            name="providerId"
            inputValue={providerId}
            options={listProviders}
            onChange={onInputChange}
            onMenuOpen={fnLoadProviders}
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
