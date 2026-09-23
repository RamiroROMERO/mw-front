import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ insurerId, customerId, listCustomers, onInputChange, fnSearch, fnExportXlsx, fnPrint }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6">
          <SearchSelect
            label="page.cxcByInsurer.input.insurer"
            name="insurerId"
            inputValue={insurerId}
            options={listCustomers}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" md="6">
          <SearchSelect
            label="page.cxcByInsurer.input.patient"
            name="customerId"
            inputValue={customerId}
            options={listCustomers}
            onChange={onInputChange}
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
