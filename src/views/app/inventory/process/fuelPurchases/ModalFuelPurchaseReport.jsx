import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';
import { localToday } from './fuelPurchaseRules';
import { useModalFuelPurchaseReport } from './useModalFuelPurchaseReport';

const ModalFuelPurchaseReport = ({ setOpen }) => {
  const { range, errors, sendForm, downloading, onInputChange, fnDownload, fnCancel } = useModalFuelPurchaseReport({ setOpen });
  const showError = (field) => (sendForm ? errors[field] : undefined);
  const maxDate = new Date(`${localToday()}T12:00:00`);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p>{IntlMessages('page.fuelPurchases.modal.report.text')}</p>
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <DateCalendar
              name="dateStart"
              label="input.since"
              value={range.dateStart}
              onChange={onInputChange}
              maxDate={maxDate}
              feedbackText={showError('dateStart')}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <DateCalendar
              name="dateEnd"
              label="input.until"
              value={range.dateEnd}
              onChange={onInputChange}
              maxDate={maxDate}
              feedbackText={showError('dateEnd')}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" disabled={downloading} onClick={() => fnDownload('pdf')}>
          <i className="bi bi-file-earmark-pdf"></i> {` ${IntlMessages('page.fuelPurchases.report.pdf')}`}
        </Button>
        <Button color="success" disabled={downloading} onClick={() => fnDownload('xlsx')}>
          <i className="bi bi-file-earmark-excel"></i> {` ${IntlMessages('page.fuelPurchases.report.excel')}`}
        </Button>
        <Button color="secondary" disabled={downloading} onClick={fnCancel}>
          <i className="bi bi-box-arrow-right"></i> {` ${IntlMessages('button.cancel')}`}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalFuelPurchaseReport;
