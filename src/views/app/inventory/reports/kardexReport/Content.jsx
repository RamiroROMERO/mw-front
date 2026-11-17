import { Card, CardBody, Row, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { RadioGroup } from '@Components/radioGroup';
import { IntlMessages } from '@Helpers/Utils';
import { useKardexReport } from './useKardexReport';
import { REPORT_TYPES, VALUE_FILTERS } from './kardexReportRules';

const KardexReport = () => {
  const { formState, onInputChange, errors, sendForm, downloading, listStores, askStore, fnDownload } = useKardexReport();
  const show = (field) => (sendForm ? errors[field] : undefined);

  return (
    <Row>
      <Colxx xxs="12">
        <Card className="mb-3">
          <CardBody>
            <Row>
              <Colxx xxs="12" md="6">
                <RadioGroup label="page.kardexReport.title.report" name="typeId" value={formState.typeId} onChange={onInputChange} options={REPORT_TYPES.map(({ id, label }) => ({ id, label }))} feedbackText={show('typeId')} />
              </Colxx>
              <Colxx xxs="12" md="6">
                <RadioGroup label="page.kardexReport.title.options" name="valueFilterId" value={formState.valueFilterId} onChange={onInputChange} options={VALUE_FILTERS.map(({ id, label }) => ({ id, label }))} />
              </Colxx>
            </Row>
            <Row className="mt-2">
              <Colxx xxs="12" sm="6" md="3">
                <DateCalendar name="dateEnd" label="page.kardexReport.input.maxDate" value={formState.dateEnd} onChange={onInputChange} feedbackText={show('dateEnd')} />
              </Colxx>
              {askStore && (
                <Colxx xxs="12" sm="6" md="4">
                  <SearchSelect label="select.storeId" name="storeId" inputValue={formState.storeId} options={listStores} onChange={onInputChange} feedbackText={show('storeId')} />
                </Colxx>
              )}
              <Colxx xxs="12" md="5" className="div-action-button-container align-items-end">
                <Button color="primary" disabled={downloading} onClick={() => fnDownload('pdf')}>
                  <i className="bi bi-file-earmark-pdf" /> {IntlMessages('page.stock.report.pdf')}
                </Button>
                <Button color="success" disabled={downloading} onClick={() => fnDownload('xlsx')}>
                  <i className="bi bi-file-earmark-excel" /> {IntlMessages('page.stock.report.excel')}
                </Button>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
      </Colxx>
    </Row>
  );
}
export default KardexReport;
