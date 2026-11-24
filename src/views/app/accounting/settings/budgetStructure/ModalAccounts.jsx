import { useIntl } from 'react-intl';
import { Button, Input, ModalBody, ModalFooter } from 'reactstrap';

// Cuentas que se pueden enlazar a una línea Detalle (cont_budget_format_plus.sc2, SPEC v2-120-sr): de movimiento, de Ingresos, Costos o Gastos y que no estén en otra línea. La lista y la búsqueda
// vienen del servidor (GET .../availableAccounts); se marcan varias y se enlazan en un solo paso.
export const ModalAccounts = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { available, selected, search, setSearch, onToggleAccount, fnAddAccounts } = data;

  return (
    <>
      <ModalBody>
        <Input
          bsSize="sm"
          className="mb-2"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('page.budgetStructure.modal.searchAccounts')}
          data-autofocus
        />
        <div style={{ maxHeight: '45vh', overflowY: 'auto' }}>
          {available.length === 0 && <div className="text-muted small p-2">{t('page.budgetStructure.modal.noAvailable')}</div>}
          {available.map((account) => (
            <label key={account.accountCode} className="d-flex align-items-center border-bottom py-1 mb-0" style={{ cursor: 'pointer' }}>
              <input type="checkbox" className="form-check-input me-2 mt-0" checked={selected.includes(account.accountCode)} onChange={() => onToggleAccount(account.accountCode)} />
              <span>{account.accountCode} - {account.accountName} <small className="text-muted">({account.accountType})</small></span>
            </label>
          ))}
        </div>
        <div className="small text-muted mt-2">{selected.length} {t('page.budgetStructure.modal.selected')}</div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{t('button.cancel')}</Button>
        <Button color="primary" onClick={fnAddAccounts}>{t('page.budgetStructure.button.addSelected')}</Button>
      </ModalFooter>
    </>
  );
};
