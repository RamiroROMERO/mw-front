import createNotification from '@Containers/ui/Notifications';
import { request, notifyError } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import { formatNumber, validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks'
import { useEffect, useMemo, useState } from 'react'
import { buildSavePayload, isProcessed, printOptions, toFormValidation, validateFuelPurchase } from './fuelPurchaseRules'

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

  const { formState, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentTypeId: 0,
    date: '',
    orderNumber: 0,
    machineId: 0,
    plate: '',
    driverId: 0,
    kilometers: 0,
    concept: '',
    qtyDiesel: 0,
    qtyGasoline: 0,
    qtyOil: 0,
    qtyOthers: 0,
    providerId: 0,
    storeId: 0,
    productCode: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    paymentTypeId: 0,
    expenseCtaCode: '',
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    pdaNumber: 0,
    notes: ''
  });

  // Las mismas reglas del DTO del back (fuelPurchaseRules.js); se muestran por campo al intentar guardar.
  const fieldErrors = useMemo(() => validateFuelPurchase(formState), [formState]);
  const formValidation = useMemo(() => toFormValidation(fieldErrors), [fieldErrors]);

  const { id, documentTypeId } = formState;

  const fnNewFuelPurchase = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSearchFuelPurchases = () => {
    setLoading(true);
    request.GET(`inventory/process/purchaseGas`, (resp) => {
      const purchases = resp.data.map((item) => {
        item.driver = item.driverData?.name ?? ''
        item.valueTotal = formatNumber(item.total, '', 2)
        return item;
      });
      setdataFuelPurchases(purchases);
      setOpenModalFuelPurchases(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  // Una orden procesada (con partida) solo admite cambiar las observaciones; el back decide (purchaseGas.locked.processed) y el
  // duplicado de proveedor + factura lo valida él también. Los rechazos los muestra request.POST/PUT con su mensaje real.
  const processed = isProcessed(formState);

  const fnSaveFuelPurchase = () => {
    setSendForm(true);

    // Falta de combustible no tiene campo propio: se avisa aparte, como en el legacy ("Falta Tipo de Combustible").
    // Con la orden procesada solo viajan las observaciones, así que no se validan los demás campos.
    if (!processed) {
      if (fieldErrors.qtyDiesel) createNotification('warning', fieldErrors.qtyDiesel, 'alert.warning.title');
      if (Object.keys(fieldErrors).length > 0) {
        return;
      }
    }

    const filterDocs = listDocuments.find(item => item.value === documentTypeId);
    const documentCode = filterDocs ? filterDocs.code : "";
    const newData = buildSavePayload(formState, documentCode);

    setLoading(true);
    if (id === 0) {
      request.POST('inventory/process/purchaseGas', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    } else {
      request.PUT(`inventory/process/purchaseGas/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  // SPEC v2-34-sr: GET sin cuerpo; sin orden guardada avisa "guarde primero" y no llama al back.
  const fnPrintFuelPurchase = () => {
    printDocument({ ...printOptions(id), setLoading });
  }

  const fnDeleteFuelPurchase = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnOkDeleteFuelPurchase = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    // SPEC v2-33-sr: DELETE con confirmación. Un rechazo del back (pagos aplicados, período cerrado) muestra su mensaje real y la
    // orden se queda en pantalla.
    request.DELETE(`inventory/process/purchaseGas/${id}`, () => {
      createNotification('success', 'msg.delete.record', 'alert.success.title');
      onResetForm();
      setSendForm(false);
      setLoading(false);
    }, (resp) => {
      notifyError(resp, 'msg.delete.record.error');
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
      notifyError(resp, 'msg.save.record.error');
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
      processed,
      onResetForm
    }
  )
}
