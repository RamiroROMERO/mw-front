import createNotification from "@/containers/ui/Notifications";
import { request } from "@/helpers/core";
import { validInt } from "@/helpers/Utils";
import { useForm } from "@/hooks"
import { useEffect, useState } from "react";

export const useTicketPurchase = ({ setLoading, setTicketDetail, onResetFormDeta }) => {

  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymentTypes] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [dataOrders, setDataOrders] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewTicket, setOpenModalViewTickets] = useState(false);
  const [openModalViewOrders, setOpenModalViewOrders] = useState(false);

  const validTicket = {
    documentId: [(val) => validInt(val) > 0, "msg.required.select.typeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    date: [(val) => val !== "", "msg.required.input.date"],
    paymentTypeId: [(val) => validInt(val) > 0, "msg.required.select.paymentMethod"],
    valueTotal: [(val) => validInt(val) > 0, "msg.required.input.total"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: 0,
    date: '',
    purchaseOrder: 0,
    providerId: 0,
    paymentTypeId: 0,
    valueTotal: 0,
    notes: '',
    status: true
  }, validTicket);

  const { providerId } = formState;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setTicketDetail([]);
  }

  const fnSearchDocument = () => {
    setOpenModalViewTickets(true);
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
  }

  const fnPrintDocument = () => { }

  const fnCancelDocument = () => { }

  const fnGenerateAuxiliary = () => { }

  const fnCount = () => { }

  const fnViewPurchaseOrders = () => {
    if (providerId === 0) {
      createNotification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`inventory/process/purchaseOrders?providerId=${providerId}`, (resp) => {
      const orders = resp.data.map((item) => {
        item.provider = item.invProvider.name
        item.address = item.invProvider.address
        return item;
      });
      setDataOrders(orders);
      setOpenModalViewOrders(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewOrder = (item) => {
    item.purchaseOrder = item.id
    setLoading(true);
    request.GET(`inventory/process/purchaseOrderDetail?purchaseOrderId=${item.id}`, (resp) => {
      const ordersDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct.name
        return item;
      });
      setTicketDetail(ordersDeta);
      onBulkForm(item);
      setOpenModalViewOrders(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSettings = () => { }

  const fnReport = () => { }

  const fnExport = () => { }

  const fnDocumentCai = () => { }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.id,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      setListDocuments(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const account = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListAccounts(account);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
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
        title: "button.generateAuxiliary",
        icon: "bi bi-bookmark-check",
        onClick: fnGenerateAuxiliary
      },
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnCount
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
      },
      {
        title: "button.documentCai",
        icon: "bi bi-file-earmark-check",
        onClick: fnDocumentCai
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
      onBulkForm,
      sendForm,
      formValidation,
      openModalViewTicket,
      setOpenModalViewTickets,
      openModalViewOrders,
      setOpenModalViewOrders,
      fnViewOrder
    }
  )
}
