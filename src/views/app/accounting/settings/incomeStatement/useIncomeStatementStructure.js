import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import ModalAddAccounts from './ModalAddAccounts';

// Equivalente a cont_ester.sc2 ("Estructura de Estado de Resultado"). 7 listas de cuentas
// (Tipo 1..7) que Cierres Contables (AccountingClosureService.computeIncomeStatement) usa
// para calcular la Utilidad Neta del período. El legacy guarda TODO de una sola vez
// ("Guardar" = borra cont_eer completo y reinserta las 7 listas en memoria) — se replica
// ese mismo modelo, no hay persistencia fila-por-fila contra el backend hasta "Guardar".
//
// Tipo=7 (Descuentos/Rebajas) se administra acá igual que los demás, aunque Cierres
// Contables confirmadamente nunca lo incluye en su cálculo (no hay rama para Tipo=7 en el
// legacy btnSaldoER — ver AccountingClosureService.js) — se deja igual por fidelidad, con
// una nota en la UI para que no genere confusión más adelante.
export const TYPE_GROUPS = [
  { type: 1, label: 'page.incomeStatementStructure.group.income' },
  { type: 2, label: 'page.incomeStatementStructure.group.costOfSales' },
  { type: 3, label: 'page.incomeStatementStructure.group.expenses' },
  { type: 4, label: 'page.incomeStatementStructure.group.otherIncome' },
  { type: 5, label: 'page.incomeStatementStructure.group.otherExpenses' },
  { type: 6, label: 'page.incomeStatementStructure.group.tax' },
  { type: 7, label: 'page.incomeStatementStructure.group.discounts' }
];

const emptyGroups = () => TYPE_GROUPS.reduce((acc, g) => { acc[g.type] = []; return acc; }, {});

export const useIncomeStatementStructure = ({ setLoading }) => {
  const [groups, setGroups] = useState(emptyGroups());
  const [accountOptions, setAccountOptions] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [targetType, setTargetType] = useState(null);

  const fnSearch = () => {
    setLoading(true);
    Promise.all([
      new Promise((resolve) => request.GET('accounting/settings/incomeStatement', (resp) => resolve(resp.data), () => resolve([]))),
      new Promise((resolve) => request.GET('accounting/settings/incomeStatement/accounts', (resp) => resolve(resp.data), () => resolve([])))
    ]).then(([rows, accounts]) => {
      const nextGroups = emptyGroups();
      rows.forEach((r) => { if (nextGroups[r.type]) nextGroups[r.type].push(r); });
      setGroups(nextGroups);
      setAccountOptions(accounts.map((a) => ({ value: a.accountNumber, label: `${a.accountNumber} | ${a.accountName}` })));
      setLoading(false);
    });
  }

  useEffect(() => { fnSearch(); }, []);

  const fnOpenAdd = (type) => {
    setTargetType(type);
    setOpenAddModal(true);
  }

  const fnAddAccounts = (selected) => {
    if (!targetType || !selected?.length) { setOpenAddModal(false); return; }
    setGroups((prev) => {
      const existingCodes = new Set(prev[targetType].map((r) => r.accountNumber));
      const toAdd = selected
        .filter((o) => !existingCodes.has(o.value))
        .map((o) => ({ accountNumber: o.value, accountName: o.label.split(' | ').slice(1).join(' | '), type: targetType }));
      return { ...prev, [targetType]: [...prev[targetType], ...toAdd] };
    });
    setOpenAddModal(false);
  }

  const fnRemoveAccount = (type, accountNumber) => {
    setGroups((prev) => ({ ...prev, [type]: prev[type].filter((r) => r.accountNumber !== accountNumber) }));
  }

  const fnSave = () => {
    const rows = TYPE_GROUPS.flatMap((g) => groups[g.type]);
    setLoading(true);
    request.PUT('accounting/settings/incomeStatement', { rows }, () => {
      NotificationManager.success(IntlMessages('page.incomeStatementStructure.msg.saveSuccess'), '', 4000, null, null, '');
      setLoading(false);
    }, (err) => {
      setLoading(false);
      const backendDescription = err?.messages?.[0]?.description;
      const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || IntlMessages('page.incomeStatementStructure.msg.saveError');
      NotificationManager.error(msg, '', 5000, null, null, '');
    }, false);
  }

  const groupsWithAccountsAvailable = (type) => {
    const usedCodes = new Set(groups[type].map((r) => r.accountNumber));
    return accountOptions.filter((o) => !usedCodes.has(o.value));
  }

  const propsToModalAddAccounts = {
    ModalContent: ModalAddAccounts,
    title: 'page.incomeStatementStructure.modal.add.title',
    open: openAddModal,
    setOpen: setOpenAddModal,
    maxWidth: 'md',
    data: { options: targetType ? groupsWithAccountsAvailable(targetType) : [], fnAdd: fnAddAccounts }
  }

  return { groups, fnOpenAdd, fnRemoveAccount, fnSave, propsToModalAddAccounts }
}
