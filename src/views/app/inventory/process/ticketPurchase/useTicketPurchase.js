import createNotification from "@Containers/ui/Notifications";
import { request, buildUrl } from "@Helpers/core";
import { formatDate, validInt } from "@Helpers/Utils";
import { useForm } from "@Hooks"
import { useEffect, useState } from "react";

export const useTicketPurchase = ({ setLoading, setTicketDetail, ticketDetail, onResetFormDeta }) => {

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
  const [bulkLoadOptions, setBulkLoadOptions] = useState({ storeId: 0, accountId: 0, toInventory: false });

  const validTicket = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    date: [(val) => val !== "", "msg.required.input.date"],
    paymentTypeId: [(val) => validInt(val) > 0, "msg.required.select.paymentMethod"],
    valueTotal: [(val) => validInt(val) > 0, "msg.required.input.total"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: '',
    purchaseOrder: 0,
    providerId: 0,
    paymentTypeId: 0,
    valueTotal: 0,
    notes: '',
    pdaNumber: 0,
    numberCAI: '',
    status: true
  }, validTicket);

  const { id, documentCode, providerId, paymentTypeId, date, purchaseOrder, notes, pdaNumber } = formState;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setTicketDetail([]);
  }

  const fnMapDetailFromServer = (rows) => {
    return rows.map((item) => ({
      id: item.id,
      productCode: item.productCode,
      nameProduct: item.name,
      qty: item.quantity,
      price: item.price,
      total: item.valueTotal1,
      accountId: item.contCta,
      toInventory: validInt(item.sendInv) === 1,
      storeId: item.storeId
    }));
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
      setTicketDetail(fnMapDetailFromServer(resp.data));
      onBulkForm({
        id: item.id,
        documentCode: item.documentCode,
        documentId: item.documentId,
        date: item.date,
        purchaseOrder: item.idOc,
        providerId: item.providerId,
        paymentTypeId: item.paymentTypeId,
        notes: item.notes || '',
        pdaNumber: item.pdaNumber,
        numberCAI: item.numberCAI,
        valueTotal: resp.data.reduce((sum, line) => sum + Number(line.valueTotal1 || 0), 0)
      });
      setOpenModalViewTickets(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(pdaNumber) > 0) {
      createNotification('error', 'msg.error.ticketPurchase.already.processed', 'alert.error.title');
      return;
    }

    if (!ticketDetail || ticketDetail.length === 0) {
      createNotification('warning', 'msg.required.addProducts', 'alert.warning.title');
      return;
    }

    const detail = ticketDetail.map((line) => ({
      productCode: line.productCode,
      name: line.nameProduct,
      quantity: line.qty,
      price: line.price,
      valueTotal1: line.total,
      storeId: line.storeId || 0,
      contCta: line.accountId,
      sendInv: line.toInventory ? 1 : 0
    }));

    const payload = { date, providerId, paymentTypeId, documentCode, idOc: purchaseOrder || 0, notes, detail };

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

  const fnPrintDocument = () => { }

  const fnAccountDocument = () => {
    if (validInt(id) === 0) {
      createNotification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    if (validInt(pdaNumber) > 0) {
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
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      createNotification('error', messageKey, 'alert.error.title');
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
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      createNotification('error', messageKey, 'alert.error.title');
      setOpenMsgCancelDocument(false);
      setLoading(false);
    }, false);
  }

  const fnSettings = () => {
    setOpenModalSettings(true);
  }

  const fnReport = () => { }

  const fnExport = () => { }

  // Legacy Controlpanel21.OptPages.Page1.Controlpanelbtn1.Click (líneas 1849-1913): antes de
  // traer las líneas de la Orden de Compra, pide Almacén+Cuenta Contable+"Aplica a Inventario"
  // y los aplica uniformemente a TODAS las líneas importadas.
  const fnViewPurchaseOrders = () => {
    if (validInt(providerId) === 0) {
      createNotification('warning', 'msg.error.ticketPurchase.selectProviderFirst', 'alert.warning.title');
      return;
    }
    setOpenModalBulkLoad(true);
  }

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

  const fnViewOrder = (item) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: item.id }), (resp) => {
      const ordersDeta = resp.data.map((line) => ({
        id: line.id,
        productCode: line.productCode,
        nameProduct: line.productData?.name || '',
        qty: line.qty,
        price: line.price,
        total: line.total,
        storeId: bulkLoadOptions.storeId,
        accountId: bulkLoadOptions.accountId,
        toInventory: bulkLoadOptions.toInventory
      }));
      setTicketDetail(ordersDeta);
      const valueTotal = ordersDeta.reduce((sum, line) => sum + Number(line.total || 0), 0);
      onBulkForm({ purchaseOrder: item.id, valueTotal });
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
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {

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
    }, (err) => {

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
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(stores);
      setLoading(false);
    }, (err) => {

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
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountDocument
      },
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
