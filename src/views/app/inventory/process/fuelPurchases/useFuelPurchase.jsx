import createNotification from '@Containers/ui/Notifications';
import { request, buildUrl } from '@Helpers/core';
import { formatNumber, validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks'
import { useEffect, useState } from 'react'

export const useFuelPurchase = ({ setLoading }) => {
  const [listCars, setListCars] = useState([]);
  const [listDrivers, setListDrivers] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymenTypes] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataCars, setDataCars] = useState([]);
  const [dataDrivers, setDataDrivers] = useState([]);
  const [dataFuelPurchases, setdataFuelPurchases] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalAdminCars, setOpenModalAdminCars] = useState(false);
  const [openModalAdminDrivers, setOpenModalAdminDrivers] = useState(false);
  const [openModalFuelPurchases, setOpenModalFuelPurchases] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgAccountDocument, setOpenMsgAccountDocument] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const fuelPurchaseValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    machineId: [(val) => validInt(val) > 0, "msg.required.select.carId"],
    driverId: [(val) => validInt(val) > 0, "msg.required.select.driverId"],
    concept: [(val) => val !== "", "msg.required.input.concept"],
    documentId: [(val) => validInt(val) > 0, "msg.required.select.typeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    // Legacy: Len(cNumFac) < 19 es error (exige exactamente 19, el largo del mask
    // ***-***-**-********) y Rat('.',cNumFac) > 0 rechaza puntos.
    invoiceCode: [(val) => val.length === 19 && !val.includes('.'), "msg.required.input.numInvoice"],
    paymentTypeId: [(val) => validInt(val) > 0, "msg.required.select.paymentMethod"],
    ctaExpenseId: [(val) => validInt(val) > 0, "msg.required.input.account"],
    valTotal: [(val) => validInt(val) > 0, "msg.required.input.totalInvoice"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: 0,
    date: '',
    orderNumber: 0,
    machineId: 0,
    plate: '',
    driverId: 0,
    qtyKM: 0,
    concept: '',
    qtyGasDessel: 0,
    qtyGasGasoline: 0,
    qtyGasOil: 0,
    qtyGasOthers: 0,
    providerId: 0,
    storeId: 0,
    productId: '',
    invoiceCode: '',
    invoiceDate: '',
    invoiceExp: '',
    paymentTypeId: 0,
    ctaExpenseId: 0,
    valSubtotal: 0,
    valDiscount: 0,
    valTax: 0,
    valTotal: 0,
    pdaNumber: 0,
    notes: ''
  }, fuelPurchaseValid);

  const { id, documentId, date, orderNumber, machineId, driverId, qtyKM, concept, qtyGasDessel, qtyGasGasoline, qtyGasOil, qtyGasOthers, providerId, storeId, productId, invoiceCode, invoiceDate, invoiceExp, paymentTypeId, ctaExpenseId, valSubtotal, valDiscount, valTax, valTotal, pdaNumber, notes } = formState;

  const fnNewFuelPurchase = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSearchFuelPurchases = () => {
    setLoading(true);
    request.GET(`inventory/process/purchaseGas`, (resp) => {
      const purchases = resp.data.map((item) => {
        item.driver = item.gasDriver.name
        item.valueTotal = formatNumber(item.valTotal, '', 2)
        return item;
      });
      setdataFuelPurchases(purchases);
      setOpenModalFuelPurchases(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveFuelPurchase = () => {
    setSendForm(true);

    // Legacy btnSaveDocument.Click: "Esta Orden ya fue Procesada y no se Puede Hacer
    // Cambios en el Documento" — bloquea edición una vez contabilizado.
    if (validInt(pdaNumber) > 0) {
      createNotification('error', 'msg.error.purchase.alreadyAccounted', 'alert.error.title');
      return;
    }

    if (!isFormValid) {
      return;
    }

    if (validInt(qtyGasDessel) === 0 && validInt(qtyGasGasoline) === 0 && validInt(qtyGasOil) === 0 && validInt(qtyGasOthers) === 0) {
      createNotification('warning', 'msg.required.input.fuel', 'alert.warning.title');
      return;
    }

    const filterDocs = listDocuments.find(item => item.value === documentId);
    const documentCode = filterDocs ? filterDocs.code : "";

    const newData = {
      documentCode,
      documentId,
      date,
      orderNumber,
      machineId,
      driverId,
      qtyKM,
      concept,
      qtyGasDessel,
      qtyGasGasoline,
      qtyGasOil,
      qtyGasOthers,
      providerId,
      storeId,
      productCode: productId,
      invoiceCode,
      invoiceDate: invoiceDate !== "" ? invoiceDate : "1900-01-01",
      invoiceExp: invoiceExp !== "" ? invoiceExp : "1900-01-01",
      paymentTypeId,
      ctaExpenseId,
      valSubtotal,
      valDiscount,
      valTax,
      valTotal,
      pdaNumber,
      notes
    }

    const fnPersist = () => {
      if (id === 0) {
        setLoading(true);
        request.POST('inventory/process/purchaseGas', newData, (resp) => {
          onInputChange({ target: { name: 'id', value: resp.data.id } });
          setSendForm(false);
          setLoading(false);
        }, (err) => {
          setLoading(false);
        });
      } else {
        setLoading(true);
        request.PUT(`inventory/process/purchaseGas/${id}`, newData, () => {
          setSendForm(false);
          setLoading(false);
        }, (err) => {
          setLoading(false);
        });
      }
    }

    // Legacy btnSaveDocument.Click: valida que la factura no esté ya registrada
    // (WHERE CodProv = nCodProv AND NumFac = cNumFac sobre Cont_Combustible), solo al crear.
    if (id === 0) {
      setLoading(true);
      request.GET(buildUrl('inventory/process/purchaseGas', { providerId, invoiceCode }), (resp) => {
        setLoading(false);
        if (Array.isArray(resp.data) && resp.data.length > 0) {
          createNotification('error', 'msg.error.purchase.documentAlreadyRegistered', 'alert.error.title');
          return;
        }
        fnPersist();
      }, () => { setLoading(false); });
    } else {
      fnPersist();
    }
  }

  const fnPrintFuelPurchase = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('inventory/process/purchaseGas/exportPDFPurchase', dataPrint, 'Orden de Combustible.pdf', (err) => {
        setLoading(false);
      });
    }
  }

  const fnDeleteFuelPurchase = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnOkDeleteFuelPurchase = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.POST(`inventory/process/purchaseGas/${id}/cancel`, {}, () => {
      onResetForm();
      setLoading(false);
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      createNotification('error', messageKey, 'alert.error.title');
      setLoading(false);
    }, false);
  }

  // Legacy Controlpanel21.OptPages.Page1.btnContabDocument.Click: "ATENCIÓN!!! ¿Está Seguro
  // que desea Procesar este Documento? Esta Acción no se puede Revertir" — crea el documento
  // de compra vinculado, aplica kardex (si hay bodega+producto), la CxP y la partida contable.
  const fnAccountDocument = () => {
    if (validInt(id) === 0) {
      createNotification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    setOpenMsgAccountDocument(true);
  }

  const fnOkAccountDocument = () => {
    setOpenMsgAccountDocument(false);
    setLoading(true);
    request.POST(`inventory/process/purchaseGas/${id}/accountDocument`, {}, (resp) => {
      onInputChange({ target: { name: 'pdaNumber', value: resp.data.numberPDA } });
      createNotification('success', 'msg.success.accountDocument', 'alert.success.title');
      setLoading(false);
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      createNotification('error', messageKey, 'alert.error.title');
      setLoading(false);
    }, false);
  }

  const fnAdminCars = () => {
    setOpenModalAdminCars(true);
  }

  const fnAdminDrivers = () => {
    setOpenModalAdminDrivers(true);
  }

  const fnReport = () => { }

  const fnGlobalReport = () => { }

  const fnGetDataCars = () => {
    setLoading(true);
    request.GET(`inventory/process/gasMachines`, (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const cars = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          code: item.code
        }
      });
      setDataCars(data);
      setListCars(cars);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnGetDataDrivers = () => {
    setLoading(true);
    request.GET(`inventory/process/gasDrivers`, (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const drivers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setDataDrivers(data);
      setListDrivers(drivers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const store = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(store);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/process/stocks/getStocks`, (resp) => {
      // Bug real: la vista invProcessViewStock no expone `id`/`name`, expone
      // `productCode`/`productName` — el combo de producto quedaba con label y value
      // vacíos (undefined) antes de este fix, y el backend nunca podía aplicar kardex
      // porque `productCode` (la columna real, codprod1) nunca llegaba con valor.
      const products = resp.data.map((item) => {
        return {
          label: item.productName,
          value: item.productCode,
          storeId: item.storeId
        }
      });
      setListProducts(products);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          label: item.code + ' | ' + item.name,
          value: item.id,
          code: item.code
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
          label: item.id + ' | ' + item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/paymentTypes', (resp) => {
      const paymentMethod = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListPaymenTypes(paymentMethod);
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

    fnGetDataCars();
    fnGetDataDrivers();
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewFuelPurchase,
    fnSearch: fnSearchFuelPurchases,
    fnSave: fnSaveFuelPurchase,
    fnPrint: fnPrintFuelPurchase,
    fnDelete: fnDeleteFuelPurchase,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountDocument
      },
    ],
    buttonsOptions: [
      {
        title: "button.adminCars",
        icon: "bi bi-car-front",
        onClick: fnAdminCars
      },
      {
        title: "button.drivers",
        icon: "bi bi-person-check",
        onClick: fnAdminDrivers
      },
      {
        title: "button.report",
        icon: "bi bi-file-earmark-binary",
        onClick: fnReport
      },
      {
        title: "button.globalReport",
        icon: "bi bi-file-earmark-bar-graph",
        onClick: fnGlobalReport
      }
    ],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      onInputChange,
      listCars,
      listDrivers,
      listStores,
      listProducts,
      listDocuments,
      listProviders,
      listPaymentTypes,
      listAccounts,
      onBulkForm,
      formValidation,
      sendForm,
      openModalAdminCars,
      openModalAdminDrivers,
      setOpenModalAdminCars,
      setOpenModalAdminDrivers,
      fnGetDataCars,
      fnGetDataDrivers,
      dataCars,
      dataDrivers,
      dataFuelPurchases,
      openModalFuelPurchases,
      setOpenModalFuelPurchases,
      openMsgQuestion,
      setOpenMsgQuestion,
      fnOkDeleteFuelPurchase,
      openMsgAccountDocument,
      setOpenMsgAccountDocument,
      fnOkAccountDocument,
      onResetForm
    }
  )
}
