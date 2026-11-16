import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { RadioGroup } from '@Components/radioGroup';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { useModalMovement } from './useModalMovement';
import { MOVEMENT_MODES } from './stockMovementRules';
import { todayText } from './kardexRules';

// Movimiento por Producto (SPEC v2-45-sr): detalle o resumen de todos los productos de un tipo, en PDF o Excel.
const ModalPrintMovement = ({ setOpen }) => {
  const { form, errors, sendForm, downloading, typeOptions, onInputChange, onTypeChange, onExcludeChange, fnDownload } = useModalMovement({ setOpen });
  const showError = (field) => (sendForm ? errors[field] : undefined);
  const maxDate = new Date(`${todayText()}T12:00:00`);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SearchSelect
              label="page.stock.modal.printMovements.productType"
              name="productTypeId"
              inputValue={form.productTypeId}
              options={typeOptions}
              onChange={onTypeChange}
            />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <DateCalendar
              name="dateStart"
              label="input.since"
              value={form.dateStart}
              onChange={onInputChange}
              maxDate={maxDate}
              feedbackText={showError('dateStart')}
            />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <DateCalendar
              name="dateEnd"
              label="select.dateEnd"
              value={form.dateEnd}
              onChange={onInputChange}
              maxDate={maxDate}
              feedbackText={showError('dateEnd')}
            />
          </Colxx>
          <Colxx xxs="12">
            <RadioGroup
              label="page.stock.modal.printMovements.radio.type"
              name="modeId"
              value={form.modeId}
              onChange={onInputChange}
              options={MOVEMENT_MODES.map(({ id, label }) => ({ id, label }))}
              feedbackText={showError('modeId')}
            />
          </Colxx>
          <Colxx xxs="12">
            <Checkbox
              name="excludeAdjustments"
              label="page.stock.modal.printMovements.excludeAdjustments"
              value={form.excludeAdjustments}
              onChange={onExcludeChange}
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

export default ModalPrintMovement;
