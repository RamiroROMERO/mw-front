import { Alert, Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import { canEditAmounts, hasEntry } from './bookRecordRules';

// Editar un movimiento del Libro de Bancos (SPEC v2-29). Los montos y el tipo de cambio solo se editan en una fila suelta
// (sin partida y sin conciliar); descripción, referencia y fecha de anulación, siempre.
export const ModalEditRecord = ({ data, setOpen }) => {
  const { editRow, editForm, onEditChange, fnSaveEdit } = data;
  const amounts = editRow ? canEditAmounts(editRow) : false;

  return (
    <>
      <ModalBody>
        {editRow && hasEntry(editRow) && <Alert color="info" className="small">{IntlMessages('page.banksBook.edit.postedNotice')}</Alert>}
        {editRow && !hasEntry(editRow) && !amounts && <Alert color="info" className="small">{IntlMessages('page.banksBook.edit.reconciledNotice')}</Alert>}
        <Row>
          <Colxx xxs="12">
            <InputField name="description" value={editForm.description} onChange={onEditChange} label="page.banksBook.edit.description" maxLength={250} />
          </Colxx>
          <Colxx xxs="12" md="6">
            <InputField name="reference" value={editForm.reference} onChange={onEditChange} label="page.banksBook.edit.reference" maxLength={50} />
          </Colxx>
          <Colxx xxs="12" md="6">
            <DateCalendar name="dateNull" value={editForm.dateNull} onChange={onEditChange} label="page.banksBook.edit.dateNull" />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField name="valueDebit" value={editForm.valueDebit} onChange={onEditChange} label="page.checks.input.valueDebe" type="number" disabled={!amounts} />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField name="valueCredit" value={editForm.valueCredit} onChange={onEditChange} label="page.checks.input.valueHaber" type="number" disabled={!amounts} />
          </Colxx>
          <Colxx xxs="12" md="4">
            <InputField name="exchangeRate" value={editForm.exchangeRate} onChange={onEditChange} label="page.banksBook.edit.exchangeRate" type="number" disabled={!amounts} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{IntlMessages('button.cancel')}</Button>
        <Button color="primary" onClick={fnSaveEdit}>{IntlMessages('button.save')}</Button>
      </ModalFooter>
    </>
  );
};
