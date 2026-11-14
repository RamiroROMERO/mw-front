import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import createNotification from "@Containers/ui/Notifications";
import { request, buildUrl, notifyError } from "@Helpers/core";
import { formatDate, validInt } from "@Helpers/Utils";
import { useForm } from "@Hooks"
import {
  buildPayload, emptyForm, formFromTicket, isProcessed, lineFromOrder, lineFromServer, sumTotals, toFormValidation, validateHeader, validateLines
} from "./ticketPurchaseRules";

const MAX_LINE_ERRORS = 5;
// El combo solo ofrece lo que el back acepta: un registro inactivo (status 0 o false) se omite.
const isActive = (item) => item.status === undefined || item.status === null || (item.status !== false && Number(item.status) !== 0);

export const useTicketPurchase = ({ setLoading, setTicketDetail, ticketDetail, onResetFormDeta, accountingActive }) => {
  const intl = useIntl();

  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymentTypes] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [dataOrders, setDataOrders] = useState([]);
  const [dataTickets, setDataTickets] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewTicket, setOpenModalViewTickets] = useState(false);
  const [openModalViewOrders, setOpenModalViewOrders] = useState(false);
  const [openMsgAccountDocument, setOpenMsgAccountDocument] = useState(false);
  const [openMsgCancelDocument, setOpenMsgCancelDocument] = useState(false);
  const [openModalSettings, setOpenModalSettings] = useState(false);
  const [openModalBulkLoad, setOpenModalBulkLoad] = useState(false);
  const [bulkLoadOptions, setBulkLoadOptions] = useState({ storeId: 0, expenseCtaCode: '', toInventory: false });

  const { formState, onInputChange, onBulkForm } = useForm(emptyForm());

  const { id, providerId, pdaNumber } = formState;
  const processed = isProcessed(formState);

  // Mismas reglas que el back (ticketPurchaseRules.js): errores por campo y sin llamar al back si alguna falla.
  const headerErrors = useMemo(() => validateHeader(formState), [formState]);
  const formValidation = useMemo(() => toFormValidation(headerErrors), [headerErrors]);

  const fnNewDocument = () => {
    onBulkForm(emptyForm());
    onResetFormDeta();
    setSendForm(false);
    setTicketDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET('inventory/process/ticketPurchase', (resp) => {
      const tickets = resp.data.map((item) => ({
        ...item,
        provider: item.providerData?.name || '',
        dateIn: formatDate(item.date),
        accounted: validInt(item.pdaNumber) > 0 ? 'Sí' : 'No'
      }));
      setDataTickets(tickets);
      setOpenModalViewTickets(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnViewTicket = (item) => {
    setLoading(true);
    request.GET(`inventory/process/ticketPurchase/${item.id}/detail`, (resp) => {
      const lines = resp.data.map(lineFromServer);
      setTicketDetail(lines);
      onBulkForm(formFromTicket(item, lines));
      setSendForm(false);
      setOpenModalViewTickets(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Un texto por línea con error ("Línea 2: ..."), hasta MAX_LINE_ERRORS, para el aviso de guardado.
  const linesErrorText = (lineErrors) => {
    const rows = lineErrors.slice(0, MAX_LINE_ERRORS).map(({ index, errors }) => intl.formatMessage(
      { id: 'page.ticketPurchase.error.line' },
      { number: index, message: intl.formatMessage({ id: Object.values(errors)[0] }) }
    ));
    if (lineErrors.length > MAX_LINE_ERRORS) rows.push('…');
    return rows.join('\n');
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (Object.keys(headerErrors).length > 0) {
      return;
    }

    if (processed) {
      createNotification('error', 'msg.error.ticketPurchase.already.processed', 'alert.error.title');
      return;
    }

    if (!ticketDetail || ticketDetail.length === 0) {
      createNotification('warning', 'msg.required.addProducts', 'alert.warning.title');
      return;
    }

    const lineErrors = validateLines(ticketDetail, { accountingActive });
    if (lineErrors.length > 0) {
      createNotification('warning', { text: linesErrorText(lineErrors) }, 'alert.warning.title');
      return;
    }

    const payload = buildPayload(formState, ticketDetail, { accountingActive });

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('inventory/process/ticketPurchase', payload, (resp) => {
        onBulkForm({ id: resp.data.id });
        setSendForm(false);
        setLoading(false);
      }, () => { setLoading(false); });
    } else {
      request.PUT(`inventory/process/ticketPurchase/${id}`, payload, () => {
        setSendForm(false);
        setLoading(false);
      }, () => { setLoading(false); });
    }
  }

  // Impresión, Reporte y Exportar: sin función (el legacy los tiene; quedan para sus specs, ver Fase 4 de la revisión).
  const fnPrintDocument = () => { }

  const fnAccountDocument = () => {
    if (validInt(id) === 0) {
      createNotification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    if (processed) {
      createNotification('error', 'msg.error.ticketPurchase.already.processed', 'alert.error.title');
      return;
    }
    setOpenMsgAccountDocument(true);
  }

  const fnOkAccountDocument = () => {
    setLoading(true);
    request.POST(`inventory/process/ticketPurchase/${id}/accountDocument`, {}, (resp) => {
      onBulkForm({ pdaNumber: resp.data.numberPDA });
      createNotification('success', 'msg.success.accountDocument', 'alert.success.title');
      setOpenMsgAccountDocument(false);
      setLoading(false);
    }, (err) => {
      // El back responde con la descripción real del rechazo (cuenta del proveedor, total en cero, pagos aplicados...).
      notifyError(err, 'msg.save.record.error');
      setOpenMsgAccountDocument(false);
      setLoading(false);
    }, false);
  }

  const fnCancelDocument = () => {
    if (validInt(id) === 0) return;
    setOpenMsgCancelDocument(true);
  }

  const fnOkCancelDocument = () => {
    setLoading(true);
    request.POST(`inventory/process/ticketPurchase/${id}/cancel`, {}, () => {
      createNotification('success', 'msg.success.cancelPurchase', 'alert.success.title');
      setOpenMsgCancelDocument(false);
      setLoading(false);
      fnNewDocument();
    }, (err) => {
      notifyError(err, 'msg.save.record.error');
      setOpenMsgCancelDocument(false);
      setLoading(false);
    }, false);
  }

  const fnSettings = () => {
    setOpenModalSettings(true);
  }

  const fnReport = () => { }

  const fnExport = () => { }

  const fnConfirmBulkLoad = (options) => {
    setBulkLoadOptions(options);
    setOpenModalBulkLoad(false);
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrders', { providerId }), (resp) => {
      const orders = resp.data.map((item) => ({
        ...item,
        provider: item.providerData?.name || '',
        address: item.providerData?.address || ''
      }));
      setDataOrders(orders);
      setOpenModalViewOrders(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Legacy Controlpanel21.OptPages.Page1.Controlpanelbtn1.Click (líneas 1849-1913): antes de traer las líneas de la Orden de Compra, pide
  // Almacén + Cuenta Contable + "Aplica a Inventario" (solo con Contabilidad activa) y los aplica a TODAS las líneas importadas.
  const fnViewPurchaseOrders = () => {
    if (processed) {
      createNotification('error', 'msg.error.ticketPurchase.already.processed', 'alert.error.title');
      return;
    }
    if (validInt(providerId) === 0) {
      createNotification('warning', 'msg.error.ticketPurchase.selectProviderFirst', 'alert.warning.title');
      return;
    }
    if (accountingActive) {
      setOpenModalBulkLoad(true);
    } else {
      fnConfirmBulkLoad({ storeId: 0, expenseCtaCode: '', toInventory: false });
    }
  }

  const fnViewOrder = (item) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: item.id }), (resp) => {
      const lines = resp.data.map((line) => lineFromOrder(line, bulkLoadOptions));
      setTicketDetail(lines);
      onBulkForm({ purchaseOrderId: item.id, valueTotal: sumTotals(lines) });
      setOpenModalViewOrders(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1&useTaxDocument=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      setListDocuments(documents);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.filter(isActive).map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    setLoading(true);
    request.GET(`admin/paymentTypes`, (resp) => {
      const paymentMethods = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          usageType: item.usageType
        }
      })
      const filterPayments = paymentMethods.filter((item) => {
        return item.usageType === 2 || item.usageType === 3
      });
      setListPaymentTypes(filterPayments);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const account = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListAccounts(account);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.filter(isActive).map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(stores);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnCancel: fnCancelDocument,
    buttonsHome: [
      // Contabilizar (kardex, CxP y partida) solo existe con Contabilidad activa, igual que en el legacy.
      ...(accountingActive ? [{
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountDocument
      }] : []),
      {
        title: "button.viewPurchaseOrders",
        icon: "bi bi-file-earmark-text",
        onClick: fnViewPurchaseOrders
      }
    ],
    buttonsOptions: [
      {
        title: "button.settings",
        icon: "bi bi-sliders",
        onClick: fnSettings
      },
      {
        title: "button.report",
        icon: "bi bi-file-earmark-bar-graph",
        onClick: fnReport
      },
      {
        title: "button.exportOrder",
        icon: "bi bi-file-earmark-excel",
        onClick: fnExport
      }
    ],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      onInputChange,
      listDocuments,
      listProviders,
      listPaymentTypes,
      listAccounts,
      listStores,
      dataOrders,
      dataTickets,
      onBulkForm,
      sendForm,
      formValidation,
      processed,
      pdaNumber,
      openModalViewTicket,
      setOpenModalViewTickets,
      openModalViewOrders,
      setOpenModalViewOrders,
      fnViewOrder,
      fnViewTicket,
      openMsgAccountDocument,
      setOpenMsgAccountDocument,
      fnOkAccountDocument,
      openMsgCancelDocument,
      setOpenMsgCancelDocument,
      fnOkCancelDocument,
      openModalSettings,
      setOpenModalSettings,
      openModalBulkLoad,
      setOpenModalBulkLoad,
      fnConfirmBulkLoad
    }
  )
}
