import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { IntlMessages, getPrivilegeData } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import {
  PRIVILEGE_SCREEN, INITIAL_LINE_FORM, isDetail, validateLine, buildLinePayload, mapLineToForm, spreadFirstMonth, moveId, actionText, formatAmount
} from './budgetRules';

const BASE = 'accounting/settings/budgetFormat';

// Estructura de Presupuesto (cont_budget_format*.sc2, SPEC v2-120-sr). La hoja se lista en su orden; el back calcula y guarda las filas Total y Acumulado después de cada cambio, así que esta
// pantalla solo muestra lo que devuelve. Validación por campo con las mismas reglas del back (budgetRules.js): un formulario inválido se marca y NO llama al back. "Eliminar" es una baja física
// de la línea y sus cuentas (con confirmación); subir y bajar manda el orden completo (PUT .../order).
export const useBudget = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);

  const screen = useMemo(() => {
    try {
      return getPrivilegeData(PRIVILEGE_SCREEN);
    } catch {
      return {};
    }
  }, []);
  const privileges = { create: Boolean(screen.fnCreate), update: Boolean(screen.fnUpdate), delete: Boolean(screen.fnDelete) };

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ...INITIAL_LINE_FORM });
  const [accounts, setAccounts] = useState([]); // cuentas enlazadas a la línea en edición
  const [sendForm, setSendForm] = useState(false);
  const [openLine, setOpenLine] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const [openAccounts, setOpenAccounts] = useState(false);
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [openRemoveAccount, setOpenRemoveAccount] = useState(false);
  const [removeAccount, setRemoveAccount] = useState(null);

  const errors = useMemo(() => validateLine(form), [form]);

  const warnNoPermission = () => createNotification('warning', 'page.budgetStructure.msg.noPermission', 'alert.warning.title');

  const fnLoad = (done) => {
    setLoading(true);
    request.GET(BASE, (resp) => {
      setRows(resp.data || []);
      setLoading(false);
      if (done) done(resp.data || []);
    }, () => setLoading(false));
  };

  useEffect(() => {
    fnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- línea ----------

  const onFormChange = ({ target: { name, value } }) => setForm((prev) => ({ ...prev, [name]: value }));
  const onFirstMonthBlur = () => setForm((prev) => (prev.id ? prev : spreadFirstMonth(prev)));

  const fnNew = () => {
    if (!privileges.create) return warnNoPermission();
    setForm({ ...INITIAL_LINE_FORM });
    setAccounts([]);
    setSendForm(false);
    setOpenLine(true);
    return undefined;
  };

  // Carga la línea con sus cuentas y abre el formulario (también tras un alta de un Detalle, para enlazar sus cuentas).
  const fnOpenLine = (id) => {
    setLoading(true);
    request.GET(`${BASE}/${id}`, (resp) => {
      setForm(mapLineToForm(resp.data));
      setAccounts(resp.data.accounts || []);
      setSendForm(false);
      setOpenLine(true);
      setLoading(false);
    }, () => setLoading(false));
  };

  const fnEdit = (row) => {
    if (!privileges.update) return warnNoPermission();
    fnOpenLine(row.id);
    return undefined;
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;
    const body = buildLinePayload(form);
    setLoading(true);
    if (form.id > 0) {
      request.PUT(`${BASE}/${form.id}`, body, () => {
        setOpenLine(false);
        fnLoad();
      }, () => setLoading(false));
    } else {
      request.POST(BASE, body, (resp) => {
        const created = resp.data?.id;
        fnLoad(() => {
          if (isDetail(body.type) && created && privileges.update) fnOpenLine(created);
          else setOpenLine(false);
        });
      }, () => setLoading(false));
    }
  };

  const fnAskDelete = (row) => {
    if (!privileges.delete) return warnNoPermission();
    setDeleteRow(row);
    setOpenDelete(true);
    return undefined;
  };

  const fnDeleteOk = () => {
    setOpenDelete(false);
    setLoading(true);
    request.DELETE(`${BASE}/${deleteRow.id}`, () => fnLoad(), () => setLoading(false));
  };

  const fnMove = (row, delta) => {
    if (!privileges.update) return warnNoPermission();
    const ids = rows.map((item) => item.id);
    const next = moveId(ids, row.id, delta);
    if (next === ids) return undefined;
    setLoading(true);
    request.PUT(`${BASE}/order`, { ids: next }, () => fnLoad(), () => setLoading(false));
    return undefined;
  };

  // Excel: el back exporta lo guardado en la DB. GETPdf no notifica por sí mismo: el error se avisa aquí.
  const fnExport = () => {
    setLoading(true);
    const stop = () => setLoading(false);
    request.GETPdf(`${BASE}/export`, {}, 'Estructura de Presupuesto.xlsx', (err) => {
      stop();
      notifyError(err, 'page.budgetStructure.msg.exportError');
    }, 'GET', stop);
  };

  // ---------- cuentas de la línea ----------

  const searchRef = useRef(search);
  searchRef.current = search;
  const fnLoadAvailable = (term = searchRef.current) => {
    request.GET(buildUrl(`${BASE}/availableAccounts`, { search: term }), (resp) => setAvailable(resp.data || []), () => { });
  };

  const fnOpenAccounts = () => {
    if (!privileges.update) return warnNoPermission();
    setSelected([]);
    setSearch('');
    fnLoadAvailable('');
    setOpenAccounts(true);
    return undefined;
  };

  // Búsqueda en el servidor con un breve retraso.
  useEffect(() => {
    if (!openAccounts) return undefined;
    const timer = setTimeout(() => fnLoadAvailable(search), 300);
    return () => clearTimeout(timer);
  }, [search, openAccounts]);

  const onToggleAccount = (code) => setSelected((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]));

  const refreshLine = () => {
    request.GET(`${BASE}/${form.id}`, (resp) => setAccounts(resp.data.accounts || []), () => { });
    fnLoad();
  };

  const fnAddAccounts = () => {
    if (selected.length === 0) {
      createNotification('warning', 'page.budgetStructure.msg.selectAccounts', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`${BASE}/${form.id}/accounts`, { codes: selected }, () => {
      setOpenAccounts(false);
      setLoading(false);
      refreshLine();
    }, () => setLoading(false));
  };

  const fnAskRemoveAccount = (account) => {
    if (!privileges.update) return warnNoPermission();
    setRemoveAccount(account);
    setOpenRemoveAccount(true);
    return undefined;
  };

  const fnRemoveAccountOk = () => {
    setOpenRemoveAccount(false);
    setLoading(true);
    request.DELETE(`${BASE}/${form.id}/accounts/${removeAccount.id}`, () => {
      setLoading(false);
      refreshLine();
    }, () => setLoading(false));
  };

  // ---------- tabla ----------

  const data = rows.map((row) => ({
    ...row,
    typeText: t(`page.budgetStructure.type.${row.type}`),
    actionText: actionText(row.action),
    totalText: formatAmount(row.total),
    accountsText: isDetail(row.type) ? String(row.accountCount || 0) : ''
  }));

  const table = {
    title: IntlMessages('page.budgetStructure.table.title'),
    columns: [
      { text: IntlMessages('page.budgetStructure.table.order'), dataField: 'orderId', headerStyle: { width: '6%' } },
      { text: IntlMessages('page.budgetStructure.table.name'), dataField: 'name', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.budgetStructure.table.type'), dataField: 'typeText', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.budgetStructure.table.action'), dataField: 'actionText', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.budgetStructure.table.total'), dataField: 'totalText', headerStyle: { width: '14%' } },
      { text: IntlMessages('page.budgetStructure.table.accounts'), dataField: 'accountsText', headerStyle: { width: '8%' } }
    ],
    data,
    actions: [
      { color: 'primary', icon: 'arrow-up', toolTip: IntlMessages('page.budgetStructure.button.up'), onClick: (row) => fnMove(row, -1) },
      { color: 'primary', icon: 'arrow-down', toolTip: IntlMessages('page.budgetStructure.button.down'), onClick: (row) => fnMove(row, 1) },
      { color: 'warning', icon: 'pencil', toolTip: IntlMessages('button.edit'), onClick: fnEdit },
      { color: 'danger', icon: 'trash', toolTip: IntlMessages('button.delete'), onClick: fnAskDelete }
    ]
  };

  return {
    t, privileges, table, fnNew, fnExport,
    modalLine: { open: openLine, setOpen: setOpenLine, form, errors, sendForm, onFormChange, onFirstMonthBlur, fnSave, accounts, fnOpenAccounts, fnAskRemoveAccount, privileges },
    modalAccounts: { open: openAccounts, setOpen: setOpenAccounts, available, selected, search, setSearch, onToggleAccount, fnAddAccounts },
    propsToMsgDelete: { open: openDelete, setOpen: setOpenDelete, fnOnOk: fnDeleteOk, title: 'page.budgetStructure.msg.deleteConfirm' },
    propsToMsgRemoveAccount: { open: openRemoveAccount, setOpen: setOpenRemoveAccount, fnOnOk: fnRemoveAccountOk, title: 'page.budgetStructure.msg.removeAccountConfirm' }
  };
};
