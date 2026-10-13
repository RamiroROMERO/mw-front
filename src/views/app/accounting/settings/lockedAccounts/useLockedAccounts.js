import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, buildUrl } from '@Helpers/core';
import { IntlMessages, getPrivilegeData } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import {
  PRIVILEGE_SCREEN, NO_START, NO_END, isActive, rangeKind, formDate, validateLockForm, buildLockBody, buildUpdateBody,
  lockableAccounts
} from './lockedAccountRules';

const BASE = 'accounting/settings/lockedAccounts';
const EMPTY_FORM = { accountCode: '', reason: '', dateStart: '', dateEnd: '' };

export const useLockedAccounts = ({ setLoading }) => {
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

  const [status, setStatus] = useState('1');
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null); // fila en edición (null = bloquear una nueva)
  const [form, setForm] = useState(EMPTY_FORM);
  const [openMsgUnlock, setOpenMsgUnlock] = useState(false);
  const [unlockRow, setUnlockRow] = useState(null);

  const statusRef = useRef(status);
  statusRef.current = status;

  const fnLoad = (wanted = statusRef.current) => {
    setLoading(true);
    request.GET(buildUrl(BASE, { status: wanted }), (resp) => {
      setRows(resp.data || []);
      setLoading(false);
    }, () => setLoading(false));
  };

  useEffect(() => {
    fnLoad('1');
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setAccounts((resp.data || []).map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta, blocked: Boolean(item.blocked) })));
    }, () => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStatusChange = ({ target: { value } }) => {
    const next = value || 'all';
    setStatus(next);
    fnLoad(next);
  };

  const onFormChange = ({ target: { name, value } }) => setForm((prev) => ({ ...prev, [name]: value || '' }));

  const fnNew = () => {
    if (!privileges.create) {
      createNotification('warning', 'page.lockedAccounts.msg.noPermission', 'alert.warning.title');
      return;
    }
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpenModal(true);
  };

  const fnEdit = (row) => {
    if (!privileges.update) {
      createNotification('warning', 'page.lockedAccounts.msg.noPermission', 'alert.warning.title');
      return;
    }
    if (!isActive(row)) return;
    setEditing(row);
    setForm({
      accountCode: row.accountCode, reason: row.reason || '',
      dateStart: formDate(row.dateStart, NO_START), dateEnd: formDate(row.dateEnd, NO_END)
    });
    setOpenModal(true);
  };

  const fnSave = () => {
    const invalid = validateLockForm(form, { creating: !editing });
    if (invalid) {
      createNotification('warning', invalid, 'alert.warning.title');
      return;
    }
    setLoading(true);
    const done = () => {
      setOpenModal(false);
      setLoading(false);
      fnLoad();
      request.GET('accounting/settings/accountants/getSL', (resp) => {
        setAccounts((resp.data || []).map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta, blocked: Boolean(item.blocked) })));
      }, () => { });
    };
    if (editing) {
      const body = buildUpdateBody(editing, form);
      if (Object.keys(body).length === 0) {
        setLoading(false);
        createNotification('warning', 'page.lockedAccounts.msg.noChanges', 'alert.warning.title');
        return;
      }
      request.PUT(`${BASE}/${editing.id}`, body, done, () => setLoading(false));
    } else {
      request.POST(BASE, buildLockBody(form), done, () => setLoading(false));
    }
  };

  const fnAskUnlock = (row) => {
    if (!privileges.delete) {
      createNotification('warning', 'page.lockedAccounts.msg.noPermission', 'alert.warning.title');
      return;
    }
    if (!isActive(row)) return;
    setUnlockRow(row);
    setOpenMsgUnlock(true);
  };

  const fnUnlockOk = () => {
    setOpenMsgUnlock(false);
    setLoading(true);
    request.DELETE(`${BASE}/${unlockRow.id}`, () => {
      setLoading(false);
      fnLoad();
    }, () => setLoading(false));
  };

  const columns = [
    { text: IntlMessages('page.lockedAccounts.table.account'), dataField: 'accountCode', headerStyle: { width: '12%' } },
    { text: IntlMessages('page.lockedAccounts.table.name'), dataField: 'accountName', headerStyle: { width: '23%' } },
    { text: IntlMessages('page.lockedAccounts.table.scope'), dataField: 'scope', headerStyle: { width: '20%' } },
    { text: IntlMessages('page.lockedAccounts.table.reason'), dataField: 'reason', headerStyle: { width: '27%' } },
    { text: IntlMessages('page.lockedAccounts.table.state'), dataField: 'stateText', headerStyle: { width: '8%' } }
  ];
  const data = rows.map((row) => {
    const kind = rangeKind(row);
    const scope = kind === 'always'
      ? t('page.lockedAccounts.scope.always')
      : t(`page.lockedAccounts.scope.${kind}`, { start: String(row.dateStart || '').slice(0, 10), end: String(row.dateEnd || '').slice(0, 10) });
    return { ...row, scope, stateText: t(isActive(row) ? 'page.lockedAccounts.state.active' : 'page.lockedAccounts.state.lifted') };
  });

  const table = {
    title: IntlMessages('page.lockedAccounts.table.title'),
    columns,
    data,
    actions: [
      { color: 'warning', icon: 'pencil', toolTip: IntlMessages('button.edit'), onClick: (row) => fnEdit(row) },
      { color: 'danger', icon: 'unlock', toolTip: IntlMessages('page.lockedAccounts.button.unlock'), onClick: (row) => fnAskUnlock(row) }
    ]
  };

  return {
    t, privileges, status, onStatusChange, table, fnNew,
    modal: { open: openModal, setOpen: setOpenModal, editing, form, onFormChange, fnSave, accounts: lockableAccounts(accounts) },
    propsToMsgUnlock: { open: openMsgUnlock, setOpen: setOpenMsgUnlock, fnOnOk: fnUnlockOk, title: 'page.lockedAccounts.msg.unlockConfirm' }
  };
};

