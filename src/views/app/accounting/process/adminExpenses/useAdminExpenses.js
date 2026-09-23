import { useEffect, useMemo, useState } from 'react';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import { validFloat, IntlMessagesFn } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import { NotificationManager } from '@Components/common/react-notifications';

const today = () => new Date().toISOString().substring(0, 10);

// "Gastos Administrativos" (cont_gastadmin.sc2): documento de "Solicitud de Cheque" — no es
// partida doble, `total` es simplemente la suma de cada línea (Exento+Gravado+Impuesto). Sus
// líneas se importan luego en Partidas Diarias como líneas de Débito (ver
// dailyItems/useDailyItems.js's fnOpenAdminExpenses).
export const useAdminExpenses = ({ setLoading }) => {
  const [lines, setLines] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [openEditLineModal, setOpenEditLineModal] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [openMsgDeleteLine, setOpenMsgDeleteLine] = useState(false);
  const [openMsgDeleteDoc, setOpenMsgDeleteDoc] = useState(false);
  const [lineToDelete, setLineToDelete] = useState(null);

  const savedMessage = IntlMessagesFn('page.adminExpenses.msg.saved');
  const updatedMessage = IntlMessagesFn('page.adminExpenses.msg.updated');
  const deletedMessage = IntlMessagesFn('page.adminExpenses.msg.deleted');
  const deleteErrorMessage = IntlMessagesFn('page.adminExpenses.msg.deleteError');

  const { formState, onInputChange, onBulkForm, onResetForm } = useForm({
    id: 0,
    date: today(),
    description: '',
    responsible: '',
    isLiquidated: false
  });

  const { id, date, description, isLiquidated } = formState;

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta, name: item.nombre })));
    }, () => { });
  }, []);

  const totals = useMemo(() => {
    const total = lines.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    return { total };
  }, [lines]);

  const fnNew = () => {
    onResetForm();
    setLines([]);
  }

  const fnOpenSearch = () => {
    setOpenSearchModal(true);
    request.GET('accounting/process/adminExpenses/search', (resp) => {
      setSearchResults(resp.data);
    }, () => { });
  }

  const fnSelectEntry = (row) => {
    setLoading(true);
    request.GET(`accounting/process/adminExpenses/${row.id}`, (resp) => {
      const { header, lines: detailLines } = resp.data;
      onBulkForm({ ...header, isLiquidated: !!header.isLiquidated });
      setLines(detailLines);
      setOpenSearchModal(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // "Agregar" (Commandbutton_hw1.Click): value(Total) siempre se recalcula
  // Exento+Gravado+Impuesto, igual que Textbox_hw12/16/19.LostFocus del legacy.
  const fnAddLine = (line) => {
    if (!line.documentCode) {
      createNotification('warning', 'page.adminExpenses.msg.missingDocumentCode', 'alert.warning.title');
      return false;
    }
    if (!line.date) {
      createNotification('warning', 'page.adminExpenses.msg.missingDate', 'alert.warning.title');
      return false;
    }
    if (!line.name) {
      createNotification('warning', 'page.adminExpenses.msg.missingDescription', 'alert.warning.title');
      return false;
    }
    if (!line.provider) {
      createNotification('warning', 'page.adminExpenses.msg.missingProvider', 'alert.warning.title');
      return false;
    }
    if (!line.idCtaCont) {
      createNotification('warning', 'page.adminExpenses.msg.missingAccount', 'alert.warning.title');
      return false;
    }
    const value = validFloat(line.valExent) + validFloat(line.valGrav) + validFloat(line.valTax);
    if (value === 0) {
      createNotification('warning', 'page.adminExpenses.msg.zeroItem', 'alert.warning.title');
      return false;
    }

    const account = listAccounts.find((a) => a.value === line.idCtaCont);
    setLines((prev) => [...prev, {
      ...line,
      tempId: Date.now(),
      nomcta: account?.name || line.nomcta,
      valExent: validFloat(line.valExent),
      valGrav: validFloat(line.valGrav),
      valTax: validFloat(line.valTax),
      value
    }]);
    return true;
  }

  const fnEditLine = (line) => {
    setEditingLine(line);
    setOpenEditLineModal(true);
  }

  const fnUpdateLine = (updatedLine) => {
    if (!updatedLine.idCtaCont) {
      createNotification('warning', 'page.adminExpenses.msg.missingAccount', 'alert.warning.title');
      return false;
    }
    const value = validFloat(updatedLine.valExent) + validFloat(updatedLine.valGrav) + validFloat(updatedLine.valTax);
    if (value === 0) {
      createNotification('warning', 'page.adminExpenses.msg.zeroItem', 'alert.warning.title');
      return false;
    }
    const account = listAccounts.find((a) => a.value === updatedLine.idCtaCont);
    const key = updatedLine.id || updatedLine.tempId;
    setLines((prev) => prev.map((l) => ((l.id || l.tempId) === key
      ? {
        ...updatedLine,
        nomcta: account?.name || updatedLine.nomcta,
        valExent: validFloat(updatedLine.valExent),
        valGrav: validFloat(updatedLine.valGrav),
        valTax: validFloat(updatedLine.valTax),
        value
      }
      : l)));
    setOpenEditLineModal(false);
    return true;
  }

  const fnAskDeleteLine = (line) => {
    setLineToDelete(line);
    setOpenMsgDeleteLine(true);
  }

  const fnDeleteLineOk = () => {
    const key = lineToDelete.id || lineToDelete.tempId;
    setLines((prev) => prev.filter((l) => (l.id || l.tempId) !== key));
    setOpenMsgDeleteLine(false);
  }

  const fnSave = () => {
    if (isLiquidated) {
      createNotification('warning', 'page.adminExpenses.msg.liquidated', 'alert.warning.title');
      return;
    }
    if (!date || !description) {
      createNotification('warning', 'page.adminExpenses.msg.missingData', 'alert.warning.title');
      return;
    }
    if (lines.length === 0) {
      createNotification('warning', 'page.adminExpenses.msg.noDetail', 'alert.warning.title');
      return;
    }

    const header = { date, description, responsible: formState.responsible || '' };
    const payloadLines = lines.map((l) => ({
      documentCode: l.documentCode,
      date: l.date,
      name: l.name,
      provider: l.provider,
      valExent: l.valExent,
      valGrav: l.valGrav,
      valTax: l.valTax,
      value: l.value,
      idCtaCont: l.idCtaCont,
      nomcta: l.nomcta || ''
    }));

    setLoading(true);
    if (validFloat(id) === 0) {
      request.POST('accounting/process/adminExpenses', { header, lines: payloadLines }, () => {
        setLoading(false);
        NotificationManager.success(savedMessage, '', 4000, null, null, '');
        fnNew();
      }, () => { setLoading(false); }, false);
    } else {
      request.PUT(`accounting/process/adminExpenses/${id}`, { header, lines: payloadLines }, (resp) => {
        setLoading(false);
        NotificationManager.success(updatedMessage, '', 4000, null, null, '');
        fnSelectEntry({ id: resp.data?.id || id });
      }, () => { setLoading(false); }, false);
    }
  }

  const fnAskDeleteDoc = () => {
    if (validFloat(id) === 0) return;
    if (isLiquidated) {
      createNotification('warning', 'page.adminExpenses.msg.liquidated', 'alert.warning.title');
      return;
    }
    setOpenMsgDeleteDoc(true);
  }

  const fnDeleteDocOk = () => {
    setOpenMsgDeleteDoc(false);
    setLoading(true);
    request.DELETE(`accounting/process/adminExpenses/${id}`, () => {
      setLoading(false);
      NotificationManager.success(deletedMessage, '', 4000, null, null, '');
      fnNew();
    }, (err) => {
      setLoading(false);
      const backendDescription = err?.messages?.[0]?.description;
      const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || deleteErrorMessage;
      NotificationManager.error(msg, '', 5000, null, null, '');
    }, false);
  }

  const propsToMsgDeleteLine = { open: openMsgDeleteLine, setOpen: setOpenMsgDeleteLine, fnOnOk: fnDeleteLineOk, title: 'page.adminExpenses.msg.deleteLineConfirm' };
  const propsToMsgDeleteDoc = { open: openMsgDeleteDoc, setOpen: setOpenMsgDeleteDoc, fnOnOk: fnDeleteDocOk, title: 'page.adminExpenses.msg.deleteDocConfirm' };

  return {
    formState, onInputChange,
    lines, totals, listAccounts,
    fnNew, fnSave, fnOpenSearch, fnSelectEntry,
    fnAddLine, fnEditLine, fnUpdateLine, fnAskDeleteLine,
    fnAskDeleteDoc,
    openSearchModal, setOpenSearchModal, searchResults,
    openEditLineModal, setOpenEditLineModal, editingLine,
    propsToMsgDeleteLine, propsToMsgDeleteDoc
  }
}
