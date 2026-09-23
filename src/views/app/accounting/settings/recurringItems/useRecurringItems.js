import { useEffect, useMemo, useState } from 'react';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import { validFloat, IntlMessagesFn } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import { NotificationManager } from '@Components/common/react-notifications';

// "Partidas Recurrentes" (cont_pdas_pre.sc2): plantillas de asientos que el usuario carga
// manualmente en una Partida de Diario NUEVA desde el botón "Asientos Pre." (ver
// dailyItems/useDailyItems.js's fnOpenRecurring). No es un job automático — dayRun solo
// alimenta un contador informativo.
export const useRecurringItems = ({ setLoading }) => {
  const [lines, setLines] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [openEditLineModal, setOpenEditLineModal] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [openMsgDeleteLine, setOpenMsgDeleteLine] = useState(false);
  const [openMsgDeleteDoc, setOpenMsgDeleteDoc] = useState(false);
  const [lineToDelete, setLineToDelete] = useState(null);

  const savedMessage = IntlMessagesFn('page.recurringItems.msg.saved');
  const updatedMessage = IntlMessagesFn('page.recurringItems.msg.updated');
  const deletedMessage = IntlMessagesFn('page.recurringItems.msg.deleted');
  const deleteErrorMessage = IntlMessagesFn('page.recurringItems.msg.deleteError');

  const { formState, onInputChange, onBulkForm, onResetForm } = useForm({
    id: 0,
    name: '',
    descrip: '',
    dayRun: '',
    status: true
  });

  const { id, name, descrip, dayRun, status } = formState;

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta, name: item.nombre })));
    }, () => { });
  }, []);

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.valDebe) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.valHaber) || 0), 0);
    return {
      totalDebit,
      totalCredit,
      diff: Number((totalDebit - totalCredit).toFixed(2))
    };
  }, [lines]);

  const fnNew = () => {
    onResetForm();
    setLines([]);
  }

  const fnOpenSearch = () => {
    setOpenSearchModal(true);
    request.GET('accounting/settings/recurringItems/search', (resp) => {
      setSearchResults(resp.data);
    }, () => { });
  }

  const fnSelectEntry = (row) => {
    setLoading(true);
    request.GET(`accounting/settings/recurringItems/${row.id}`, (resp) => {
      const { header, lines: detailLines } = resp.data;
      onBulkForm({ ...header, status: !!header.status });
      setLines(detailLines);
      setOpenSearchModal(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // "Agregar" (Commandbutton_hw2.Click): la Descripción de cada línea es una COPIA de la
  // Descripción/Sinopsis del encabezado en el momento de agregar la línea — no se escribe
  // por línea, se replica en bloque después con "Actualizar Items".
  const fnAddLine = (line) => {
    if (!descrip) {
      createNotification('warning', 'page.recurringItems.msg.missingSynopsis', 'alert.warning.title');
      return false;
    }
    if (!line.idCtaAccount) {
      createNotification('warning', 'page.recurringItems.msg.missingAccount', 'alert.warning.title');
      return false;
    }
    if (validFloat(line.valDebe) === 0 && validFloat(line.valHaber) === 0) {
      createNotification('warning', 'page.recurringItems.msg.zeroItem', 'alert.warning.title');
      return false;
    }

    const account = listAccounts.find((a) => a.value === line.idCtaAccount);
    setLines((prev) => [...prev, {
      ...line,
      tempId: Date.now(),
      accountName: account?.label || line.idCtaAccount,
      name: descrip,
      valDebe: validFloat(line.valDebe),
      valHaber: validFloat(line.valHaber)
    }]);
    return true;
  }

  const fnEditLine = (line) => {
    setEditingLine(line);
    setOpenEditLineModal(true);
  }

  const fnUpdateLine = (updatedLine) => {
    if (!updatedLine.idCtaAccount) {
      createNotification('warning', 'page.recurringItems.msg.missingAccount', 'alert.warning.title');
      return false;
    }
    if (validFloat(updatedLine.valDebe) === 0 && validFloat(updatedLine.valHaber) === 0) {
      createNotification('warning', 'page.recurringItems.msg.zeroItem', 'alert.warning.title');
      return false;
    }
    const account = listAccounts.find((a) => a.value === updatedLine.idCtaAccount);
    const key = updatedLine.id || updatedLine.tempId;
    setLines((prev) => prev.map((l) => ((l.id || l.tempId) === key
      ? {
        ...updatedLine,
        accountName: account?.label || updatedLine.idCtaAccount,
        valDebe: validFloat(updatedLine.valDebe),
        valHaber: validFloat(updatedLine.valHaber)
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

  // "Actualizar Items" (Commandbutton_hw1.Click): reemplaza la Descripción de TODAS las
  // líneas ya agregadas con el valor actual del encabezado — no toca cuenta/valores.
  const fnUpdateAllLinesDescription = () => {
    if (lines.length === 0) return;
    setLines((prev) => prev.map((l) => ({ ...l, name: descrip })));
    NotificationManager.success(IntlMessagesFn('page.recurringItems.msg.itemsUpdated'), '', 3000, null, null, '');
  }

  const fnSave = () => {
    if (!name || !descrip || !validFloat(dayRun)) {
      createNotification('warning', 'page.recurringItems.msg.missingData', 'alert.warning.title');
      return;
    }
    if (lines.length === 0) {
      createNotification('warning', 'page.recurringItems.msg.noDetail', 'alert.warning.title');
      return;
    }
    if (totals.diff !== 0) {
      createNotification('warning', 'page.recurringItems.msg.unbalanced', 'alert.warning.title');
      return;
    }

    const header = { name, descrip, dayRun: validFloat(dayRun, 0), status };
    const payloadLines = lines.map((l) => ({
      idCtaAccount: l.idCtaAccount,
      name: l.name,
      valDebe: l.valDebe,
      valHaber: l.valHaber,
      referenceCode: l.referenceCode || ''
    }));

    setLoading(true);
    if (validFloat(id) === 0) {
      request.POST('accounting/settings/recurringItems', { header, lines: payloadLines }, () => {
        setLoading(false);
        NotificationManager.success(savedMessage, '', 4000, null, null, '');
        fnNew();
      }, () => { setLoading(false); }, false);
    } else {
      request.PUT(`accounting/settings/recurringItems/${id}`, { header, lines: payloadLines }, (resp) => {
        setLoading(false);
        NotificationManager.success(updatedMessage, '', 4000, null, null, '');
        fnSelectEntry({ id: resp.data?.id || id });
      }, () => { setLoading(false); }, false);
    }
  }

  const fnAskDeleteDoc = () => {
    if (validFloat(id) === 0) return;
    setOpenMsgDeleteDoc(true);
  }

  const fnDeleteDocOk = () => {
    setOpenMsgDeleteDoc(false);
    setLoading(true);
    request.DELETE(`accounting/settings/recurringItems/${id}`, () => {
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

  const propsToMsgDeleteLine = { open: openMsgDeleteLine, setOpen: setOpenMsgDeleteLine, fnOnOk: fnDeleteLineOk, title: 'page.recurringItems.msg.deleteLineConfirm' };
  const propsToMsgDeleteDoc = { open: openMsgDeleteDoc, setOpen: setOpenMsgDeleteDoc, fnOnOk: fnDeleteDocOk, title: 'page.recurringItems.msg.deleteDocConfirm' };

  return {
    formState, onInputChange,
    lines, totals, listAccounts,
    fnNew, fnSave, fnOpenSearch, fnSelectEntry,
    fnAddLine, fnEditLine, fnUpdateLine, fnAskDeleteLine, fnUpdateAllLinesDescription,
    fnAskDeleteDoc,
    openSearchModal, setOpenSearchModal, searchResults,
    openEditLineModal, setOpenEditLineModal, editingLine,
    propsToMsgDeleteLine, propsToMsgDeleteDoc
  }
}
