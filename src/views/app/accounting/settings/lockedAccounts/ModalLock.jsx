import { Alert, Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

// Bloquear una cuenta o editar el motivo y el rango de un bloqueo vigente (SPEC v2-30). Las fechas son opcionales: vacías = siempre.
export const ModalLock = ({ data, setOpen }) => {
  const { editing, form, onFormChange, fnSave, accounts } = data;

  return (
    <>
      <ModalBody>
        <Alert color="info" className="small">{IntlMessages('page.lockedAccounts.modal.notice')}</Alert>
        <Row>
          <Colxx xxs="12">
            {editing ? (
              <InputField name="accountCode" value={`${editing.accountCode} - ${editing.accountName || ''}`} onChange={() => { }} label="page.lockedAccounts.table.account" disabled />
            ) : (
              <SearchSelect
                name="accountCode"
                inputValue={form.accountCode}
                onChange={onFormChange}
                label="page.lockedAccounts.table.account"
                options={accounts}
              />
            )}
          </Colxx>
          <Colxx xxs="12">
            <InputField name="reason" value={form.reason} onChange={onFormChange} label="page.lockedAccounts.table.reason" maxLength={250} />
          </Colxx>
          <Colxx xxs="12" md="6">
            <DateCalendar name="dateStart" value={form.dateStart} onChange={onFormChange} label="page.lockedAccounts.modal.dateStart" />
          </Colxx>
          <Colxx xxs="12" md="6">
            <DateCalendar name="dateEnd" value={form.dateEnd} onChange={onFormChange} label="page.lockedAccounts.modal.dateEnd" />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{IntlMessages('button.cancel')}</Button>
        <Button color="primary" onClick={fnSave}>{IntlMessages('button.save')}</Button>
      </ModalFooter>
    </>
  );
};
