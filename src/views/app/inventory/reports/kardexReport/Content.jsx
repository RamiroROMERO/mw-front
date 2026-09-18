import { Card, CardBody, Row, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { RadioGroup } from '@Components/radioGroup';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';
import { useKardexReport } from './useKardexReport';

const REPORT_TYPE_OPTIONS = [
  { id: 1, label: 'page.kardexReport.radio.existence' },
  { id: 2, label: 'page.kardexReport.radio.generalExistence' },
  { id: 3, label: 'page.kardexReport.radio.noMovement' },
  { id: 4, label: 'page.kardexReport.radio.byExpiryDate' }
];

const OPTION_OPTIONS = [
  { id: 1, label: 'page.kardexReport.radio.withStock' },
  { id: 2, label: 'page.kardexReport.radio.zeroOrNegative' },
  { id: 3, label: 'page.kardexReport.radio.all' }
];

const KardexReport = ({ setLoading }) => {
  const { formState, onInputChange, onReportTypeChange, fnSearch, listStores, needsStore, needsOption, data, columns } = useKardexReport({ setLoading });
  const { reportType, option, storeId, maxDate } = formState;

  return (
    <Row>
      <Colxx xxs="12">
        <Card className="mb-3">
          <CardBody>
            <Row>
              <Colxx xxs="12" md="6">
                <RadioGroup
                  label="page.kardexReport.title.report"
                  name="reportType"
                  value={reportType}
                  onChange={onReportTypeChange}
                  options={REPORT_TYPE_OPTIONS}
                />
              </Colxx>
              {needsOption && (
                <Colxx xxs="12" md="6">
                  <RadioGroup
                    label="page.kardexReport.title.options"
                    name="option"
                    value={option}
                    onChange={onInputChange}
                    options={OPTION_OPTIONS}
                  />
                </Colxx>
              )}
            </Row>
            <Row className="mt-2">
              <Colxx xxs="12" sm="6" md="3">
                <DateCalendar
                  name="maxDate"
                  label="page.kardexReport.input.maxDate"
                  value={maxDate}
                  onChange={onInputChange}
                />
              </Colxx>
              {needsStore && (
                <Colxx xxs="12" sm="6" md="4">
                  <SearchSelect
                    label="select.storeId"
                    name="storeId"
                    inputValue={storeId}
                    options={listStores}
                    onChange={onInputChange}
                  />
                </Colxx>
              )}
              <Colxx xxs="12" md="5" className="div-action-button-container align-items-end">
                <Button color="primary" onClick={fnSearch}>
                  <i className="bi bi-search" /> {IntlMessages('button.search')}
                </Button>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
        <ReactTable columns={columns} data={data} options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }} />
      </Colxx>
    </Row>
  );
}
export default KardexReport;
