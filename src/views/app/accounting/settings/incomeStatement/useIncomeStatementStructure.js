import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import ModalAddAccounts from './ModalAddAccounts';
import { TYPE_GROUPS, emptyGroups, splitAddable, validateStructure } from './incomeStatementRules';

export { TYPE_GROUPS };

const BASE = 'accounting/settings/incomeStatement';

// Estructura de Estado de Resultado (cont_ester.sc2, SPEC v2-122-sr). 7 grupos de cuentas que usan Cierres Contables, el Estado de Resultado y la Balanza, que suman cada cuenta POR PREFIJO:
// por eso una cuenta no puede repetirse, estar en dos grupos ni estar dentro de otra (incomeStatementRules.js, igual que el back). El nombre de la cuenta no se guarda: viene de cont_ctas.
// Como el legacy, "Guardar" reemplaza toda la estructura de una vez.
export const useIncomeStatementStructure = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);

  const [groups, setGroups] = useState(emptyGroups());
  const [accountOptions, setAccountOptions] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [targetType, setTargetType] = useState(null);

  const toGroups = (rows) => {
    const next = emptyGroups();
    rows.forEach((r) => { if (next[r.type]) next[r.type].push(r); });
    return next;
  };

  const fnSearch = () => {
    setLoading(true);
    Promise.all([
      new Promise((resolve) => request.GET(BASE, (resp) => resolve(resp.data), () => resolve([]))),
      new Promise((resolve) => request.GET(`${BASE}/accounts`, (resp) => resolve(resp.data), () => resolve([])))
    ]).then(([rows, accounts]) => {
      setGroups(toGroups(rows));
      setAccountOptions(accounts.map((a) => ({
        value: a.accountNumber, name: a.accountName, level: a.level, label: `${a.accountNumber} | ${a.accountName} (${t('page.incomeStatementStructure.level', { level: a.level })})`
      })));
      setLoading(false);
    });
  };

  useEffect(() => { fnSearch(); }, []);

  const fnOpenAdd = (type) => {
    setTargetType(type);
    setOpenAddModal(true);
  };

  const fnAddAccounts = (selected) => {
    if (!targetType || !selected?.length) { setOpenAddModal(false); return; }
    const all = TYPE_GROUPS.flatMap((g) => groups[g.type]);
    const { accepted, rejected } = splitAddable(selected.map((o) => o.value), all);
    if (rejected.length) NotificationManager.warning(t('page.incomeStatementStructure.msg.addSkipped', { codes: rejected.join(', ') }), '', 6000, null, null, '');
    const byCode = new Map(selected.map((o) => [o.value, o]));
    setGroups((prev) => ({
      ...prev,
      [targetType]: [...prev[targetType], ...accepted.map((code) => ({ accountNumber: code, accountName: byCode.get(code).name, type: targetType }))]
    }));
    setOpenAddModal(false);
  };

  const fnRemoveAccount = (type, accountNumber) => {
    setGroups((prev) => ({ ...prev, [type]: prev[type].filter((r) => r.accountNumber !== accountNumber) }));
  };

  const fnSave = () => {
    const rows = TYPE_GROUPS.flatMap((g) => groups[g.type]);
    const problem = validateStructure(rows);
    if (problem) {
      NotificationManager.warning(t(problem.id, { detail: problem.detail }), '', 6000, null, null, '');
      return;
    }
    setLoading(true);
    // El back responde con la estructura guardada (con los nombres actuales de cont_ctas); un rechazo lo muestra `request` con su mensaje real.
    request.PUT(BASE, { rows: rows.map((r) => ({ accountNumber: r.accountNumber, type: r.type })) }, (resp) => {
      setGroups(toGroups(resp.data || []));
      setLoading(false);
    }, () => setLoading(false));
  };

  const propsToModalAddAccounts = {
    ModalContent: ModalAddAccounts,
    title: 'page.incomeStatementStructure.modal.add.title',
    open: openAddModal,
    setOpen: setOpenAddModal,
    maxWidth: 'md',
    data: { options: accountOptions.filter((o) => !(targetType && groups[targetType].some((r) => r.accountNumber === o.value))), fnAdd: fnAddAccounts }
  };

  return { groups, fnOpenAdd, fnRemoveAccount, fnSave, propsToModalAddAccounts };
};
