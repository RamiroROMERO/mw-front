import createNotification from '@/containers/ui/Notifications';
import { request } from '@/helpers/core';
import { formatNumber, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks'
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
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const fuelPurchaseValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    machineId: [(val) => validInt(val) > 0, "msg.required.select.carId"],
    driverId: [(val) => validInt(val) > 0, "msg.required.select.driverId"],
    concept: [(val) => val !== "", "msg.required.input.concept"],
    documentId: [(val) => validInt(val) > 0, "msg.required.select.typeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    invoiceCode: [(val) => val.length > 0 && val.length < 20, "msg.required.input.numInvoice"],
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
    productId: 0,
    invoiceCode: '',
    invoiceDate: '',
    invoiceExp: '',
    paymentTypeId: 0,
    ctaExpenseId: 0,
    valSubtotal: 0,
    valDiscount: 0,
    valTax: 0,
    valTotal: 0,
    pdaNumber: '',
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
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveFuelPurchase = () => {
    setSendForm(true);
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
      productId,
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

    if (id === 0) {
      setLoading(true);
      request.POST('inventory/process/purchaseGas', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`inventory/process/purchaseGas/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }

  }

  const fnPrintFuelPurchase = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('inventory/process/purchaseGas/exportPDFPurchase', dataPrint, 'Orden de Combustible.pdf', (err) => {
        console.error(err);
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
    request.DELETE(`inventory/process/purchaseGas/${id}`, (resp) => {
      console.log(resp);
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnCount = () => { }

  const fnGenerateAuxiliary = () => { }

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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET(`inventory/process/stocks/getStocks`, (resp) => {
      const products = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          storeId: item.storeId
        }
      });
      setListProducts(products);
      setLoading(false);
    }, (err) => {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
        title: "button.generateAuxiliary",
        icon: "bi bi-bookmark-check",
        onClick: fnGenerateAuxiliary
      },
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnCount
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
      onResetForm
    }
  )
}
