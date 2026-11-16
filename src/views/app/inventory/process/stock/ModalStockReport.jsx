import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { RadioGroup } from '@Components/radioGroup';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { useModalStock } from './useModalStock';
import { REPORT_TYPES, VALUE_FILTERS } from './stockReportRules';

// Reportes de Existencias (SPEC v2-44-sr). Ya no pide producto, unidades, fecha inicial ni la casilla de exportar: son reportes "al" una
// fecha y el formato se elige con el botón (PDF o Excel).
const ModalStockReport = ({ setOpen, data }) => {
  const { listStores } = data;
  const { form, errors, sendForm, downloading, askStore, onInputChange, onStoreChange, fnDownload } = useModalStock({ setOpen });
  const showError = (field) => (sendForm ? errors[field] : undefined);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <RadioGroup
              label="page.stock.modal.stockReports.radio.type"
              name="typeId"
              value={form.typeId}
              onChange={onInputChange}
              options={REPORT_TYPES.map(({ id, label }) => ({ id, label }))}
              feedbackText={showError('typeId')}
            />
          </Colxx>
          {askStore && (
            <Colxx xxs="12">
              <SearchSelect
                label="select.storeId"
                name="storeId"
                inputValue={form.storeId}
                options={listStores}
                onChange={onStoreChange}
                feedbackText={showError('storeId')}
              />
            </Colxx>
          )}
          <Colxx xxs="12" sm="6">
            <DateCalendar
              name="dateEnd"
              label="page.stock.modal.stockReports.dateEnd"
              value={form.dateEnd}
              onChange={onInputChange}
              feedbackText={showError('dateEnd')}
            />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <RadioGroup
              label="page.stock.modal.stockReports.radio.typeValues"
              name="valueFilterId"
              value={form.valueFilterId}
              onChange={onInputChange}
              options={VALUE_FILTERS.map(({ id, label }) => ({ id, label }))}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={downloading} onClick={() => fnDownload('pdf')}>
          <i className="bi bi-file-earmark-pdf" /> {` ${IntlMessages('page.stock.report.pdf')}`}
        </Button>
        <Button color="success" disabled={downloading} onClick={() => fnDownload('xlsx')}>
          <i className="bi bi-file-earmark-excel" /> {` ${IntlMessages('page.stock.report.excel')}`}
        </Button>
        <Button color="danger" disabled={downloading} onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalStockReport;
