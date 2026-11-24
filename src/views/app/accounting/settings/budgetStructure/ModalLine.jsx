import { useIntl } from 'react-intl';
import { Alert, Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import { MAX_NAME, MONTHS, TYPES, ACTIONS, isDetail, monthKey } from './budgetRules';

// Alta o edición de una línea de la estructura de presupuesto (cont_budget_format_plus.sc2, SPEC v2-120-sr). Solo un Detalle captura sus 12 meses, lleva acción y enlaza cuentas; Titulo, Total
// y Acumulado se calculan en el back. Un solo useIntl: los textos nunca se piden dentro de una condición.
export const ModalLine = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { form, errors, sendForm, onFormChange, onFirstMonthBlur, fnSave, accounts, fnOpenAccounts, fnAskRemoveAccount, privileges } = data;
  const detail = isDetail(form.type);
  // `feedbackText` lo traduce el propio componente: se le pasa el id de traducción, no el texto.
  const show = (key) => (sendForm && errors[key] ? errors[key] : null);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" md="6">
            <InputField name="name" value={form.name} onChange={onFormChange} label="page.budgetStructure.table.name" maxLength={MAX_NAME} invalid={!!show('name')} feedbackText={show('name')} />
          </Colxx>
          <Colxx xxs="6" md="3">
            <SimpleSelect
              name="type"
              label="page.budgetStructure.table.type"
              value={form.type}
              onChange={onFormChange}
              options={TYPES.map((value) => ({ id: value, name: t(`page.budgetStructure.type.${value}`) }))}
              invalid={!!show('type')}
              feedbackText={show('type')}
            />
          </Colxx>
          <Colxx xxs="6" md="3">
            <SimpleSelect
              name="action"
              label="page.budgetStructure.table.action"
              value={detail ? form.action : ''}
              onChange={onFormChange}
              options={ACTIONS.map((value) => ({ id: value, name: t(`page.budgetStructure.action.${value}`) }))}
              disabled={!detail}
              invalid={!!show('action')}
              feedbackText={show('action')}
            />
          </Colxx>
        </Row>
        {!detail && <Alert color="info" className="small">{t('page.budgetStructure.modal.calculated')}</Alert>}
        <Row>
          {MONTHS.map((month) => (
            <Colxx xxs="6" md="3" key={month}>
              <InputField
                name={monthKey(month)}
                value={form[monthKey(month)]}
                onChange={onFormChange}
                onBlur={month === 1 ? onFirstMonthBlur : undefined}
                label={`page.budgetStructure.input.month${month}`}
                type="number"
                min="0"
                step="0.01"
                disabled={!detail}
                invalid={!!show(monthKey(month))}
                feedbackText={show(monthKey(month))}
              />
            </Colxx>
          ))}
        </Row>
        {detail && (
          <>
            <hr />
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{t('page.budgetStructure.modal.accounts')}</strong>
              <Button color="primary" size="sm" outline disabled={!form.id || !privileges.update} onClick={fnOpenAccounts}>
                <i className="bi bi-plus-lg" /> {t('page.budgetStructure.button.addAccounts')}
              </Button>
            </div>
            {!form.id && <Alert color="secondary" className="small">{t('page.budgetStructure.modal.saveFirst')}</Alert>}
            {form.id > 0 && accounts.length === 0 && <div className="text-muted small">{t('page.budgetStructure.modal.noAccounts')}</div>}
            {accounts.map((account) => (
              <div key={account.id} className="d-flex justify-content-between align-items-center border-bottom py-1">
                <span>
                  {account.accountCode} - {account.accountName || t('page.budgetStructure.modal.accountMissing')}
                  {account.accountType ? <small className="text-muted"> ({account.accountType})</small> : null}
                </span>
                <Button color="danger" size="sm" outline onClick={() => fnAskRemoveAccount(account)} title={t('button.delete')}>
                  <i className="bi bi-trash" />
                </Button>
              </div>
            ))}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{t('button.cancel')}</Button>
        <Button color="primary" onClick={fnSave}>{t('button.save')}</Button>
      </ModalFooter>
    </>
  );
};
