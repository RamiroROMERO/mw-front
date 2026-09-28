import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages } from '@Helpers/Utils';

export const ModalNewConciliation = ({ data }) => {
  const { formStateNew, onInputChangeNew, listPeriods, listBanks, formValidationNew, sendFormNew, fnCreateConciliation } = data;
  const { periodId, bankCode, date } = formStateNew;

  return (
    <>
      <Row>
        <Colxx xxs="12" md="6">
          <SearchSelect
            label="page.bankConciliation.select.period"
            name="periodId"
            inputValue={periodId}
            options={listPeriods}
            onChange={onInputChangeNew}
            feedbackText={sendFormNew && formValidationNew.periodIdValid || null}
          />
        </Colxx>
        <Colxx xxs="12" md="6">
          <SearchSelect
            label="select.bankCode"
            name="bankCode"
            inputValue={bankCode}
            options={listBanks}
            onChange={onInputChangeNew}
            feedbackText={sendFormNew && formValidationNew.bankCodeValid || null}
          />
        </Colxx>
        <Colxx xxs="12" md="6">
          <DateCalendar name="date" label="table.column.date" value={date} onChange={onInputChangeNew} />
        </Colxx>
      </Row>
      <Row className="mt-3">
        <Colxx xxs="12" align="right">
          <Button color="primary" onClick={fnCreateConciliation}>
            <i className="bi bi-check-lg" /> {IntlMessages('button.save')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}
