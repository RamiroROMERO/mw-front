import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@Hooks';
import { Button } from 'reactstrap';
import { IntlMessagesFn, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { RandomCodeGenerator } from '@Helpers/UuIdGenerator';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';
import TableButtons from '@Components/tableButtons';
import ModalViewCust from '../customers/ModalViewCust';
import ModalProducts from '../invoicing/ModalProducts';
import ModalSeekQuotes from '../quotes/ModalSeekQuotes';
import { ModalEditCurrentProduct } from '../quotes/ModalEditCurrentProduct';
import { ModalNewCustomer } from '../quotes/ModalNewCustomer';
import ModalSendEmail from '../quotes/ModalSendEmail';
import ModalSeekPurchaseOrders from './ModalSeekPurchaseOrders';
import {
  buildInitialForm, buildOrderPayload, formFromOrder, isQuoteLocked, lineFromApi, lineFromProduct, orderTotals, validateOrder
} from './purchaseOrderRules';

const ORDERS_URL = 'billing/process/purchaseOrders';
const NO_SETTINGS = { canEditPrice: false, timeQuote: 0, limitDate: null, hasDateOutControl: false };

// Órdenes de compra de clientes (fac_purchase_orders.sc2). Igual que Cotizaciones (SPEC v2-66-sr): guardar y eliminar son UNA llamada (el back guarda cabecera y líneas
// en una transacción y calcula los importes), la pantalla valida lo mismo que el back antes de llamar y guarda en memoria `GET .../settings` (permiso de editar precio,
// límite de edición y control de lote y fecha). Propio de la orden (SPEC v2-67-sr): cliente CREADO obligatorio, forma de pago y orden exonerada con su constancia.
export const usePurchaseOrders = ({ setLoading, setActiveTab, screenControl = {}, canDelete = false }) => {

  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteItem, setOpenMsgDeleteItem] = useState(false);
  const [openMsgLoadQuote, setOpenMsgLoadQuote] = useState(false);
  const [pendingQuote, setPendingQuote] = useState(null);
  const [openSeekCustomer, setOpenSeekCustomer] = useState(false);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [openSeekProducts, setOpenSeekProducts] = useState(false);
  const [openEditCurrentProduct, setOpenEditCurrentProduct] = useState(false);
  const [openSeekDocument, setOpenSeekDocument] = useState(false);
  const [openSeekQuote, setOpenSeekQuote] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [sellerList, setSellerList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [paymentTypeList, setPaymentTypeList] = useState([]);
  const [settings, setSettings] = useState(NO_SETTINGS);
  // Formato de fecha configurado por el Administrador (mw_setting.form_date) — DMY es el default del legacy cuando el ajuste viene vacío.
  const [dateFormat, setDateFormat] = useState('DMY');
  const [dataDetails, setDataDetails] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEditItem, setIsEditItem] = useState(false);

  const [itemToDelete, setItemToDelete] = useState('');
  const [nameItemToDelete, setNameItemToDelete] = useState('');

  const { formState, onInputChange, onResetForm, onBulkForm } = useForm(buildInitialForm());
  const { id, isExonerated } = formState;

  const isLocked = isQuoteLocked(formState, settings.timeQuote);
  const errors = useMemo(() => validateOrder(formState, dataDetails, { timeQuote: settings.timeQuote }), [formState, dataDetails, settings.timeQuote]);
  const totals = useMemo(() => orderTotals(dataDetails, isExonerated), [dataDetails, isExonerated]);

  const columnDetails = [
    { title: 'input.code', field: 'productCode', width: 15 },
    { title: 'input.name', field: 'productName', width: 40 },
    { title: 'input.outputUnit', field: 'unitProd', width: 15 },
    { title: 'input.qty', field: 'qty', width: 10, type: 'number' },
    { title: 'input.price', field: 'price', width: 10, type: 'currency', prefix: 'L. ' },
    { title: 'input.subtotal', field: 'subtotal', width: 15, type: 'currency', prefix: 'L. ' },
    { title: 'table.column.options', field: 'buttons', width: 15 },
  ]

  const fnDeleteItem = (code, nameItem) => {
    setItemToDelete(code);
    setNameItemToDelete(nameItem);
    setOpenMsgDeleteItem(true);
  }

  const fnEditItem = (line) => {
    setIsEditItem(true);
    setCurrentProduct(line);
    setOpenEditCurrentProduct(true);
  }

  // Los botones se arman al pintar (no se guardan en el estado) y no existen en una orden de solo lectura.
  const rows = useMemo(() => dataDetails.map((line) => ({
    ...line,
    buttons: isLocked ? null : (
      <>
        <Button type='button' color='outline-primary' className='btn-circle-table me-1' onClick={() => fnEditItem(line)}> <i className='bi bi-pencil' /> </Button>
        <Button type='button' color='outline-danger' className='btn-circle-table' onClick={() => fnDeleteItem(line.tempCode, line.productName)}> <i className='bi bi-trash' /> </Button>
      </>
    )
  })), [dataDetails, isLocked]);

  const fnEditDocument = (row) => {
    setOpenSeekDocument(false);
    setLoading(true);
    request.GET(`${ORDERS_URL}/${row.id}`, ({ data }) => {
      const form = formFromOrder(data);
      onBulkForm(form);
      setDataDetails((data.details || []).map(lineFromApi));
      setSendForm(false);
      setLoading(false);
      if (isQuoteLocked(form, settings.timeQuote)) notification('warning', 'page.billingPurchaseOrders.msg.locked', 'alert.warning.title');
    }, () => {
      setLoading(false);
    });
  }

  const fnNewDocument = () => {
    setSendForm(false);
    onResetForm();
    setDataDetails([]);
    setActiveTab("1")
  }

  const fnSearchDocument = () => setOpenSeekDocument(true);

  const fnSaveDocument = () => {
    setSendForm(true);
    if (isLocked) {
      notification('warning', 'page.billingPurchaseOrders.msg.locked', 'alert.warning.title');
      return;
    }
    if (Object.keys(errors).length > 0) {
      // Los errores de las líneas no se ven en la pestaña de datos: se avisan aparte.
      if (errors.details) notification('warning', errors.details, 'alert.warning.title');
      return;
    }
    const payload = buildOrderPayload(formState, dataDetails);
    setLoading(true);
    if (validInt(id) === 0) {
      request.POST(ORDERS_URL, payload, ({ data }) => {
        onInputChange({ target: { name: 'id', value: data.id } });
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.PUT(`${ORDERS_URL}/${id}`, payload, () => setLoading(false), () => setLoading(false));
    }
  };

  const fnPrintDocument = () => {
    printDocument({ path: ORDERS_URL, id, fileName: 'Orden de Compra.pdf', setLoading });
  }

  const fnDeleteDocument = () => {
    if (validInt(id) <= 0) return;
    if (isLocked) {
      notification('warning', 'page.billingPurchaseOrders.msg.locked', 'alert.warning.title');
      return;
    }
    setOpenMsgQuestion(true);
  };

  const fnOpenSendEmail = () => {
    if (validInt(id) <= 0) {
      notification('warning', 'msg.print.saveFirst', 'alert.warning.title');
      return;
    }
    setOpenSendEmail(true);
  };

  // Una sola llamada: el back borra las líneas y la orden en una transacción. Si lo rechaza (permiso, límite de edición) la orden se queda.
  const fnDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`${ORDERS_URL}/${id}`, () => {
      setLoading(false);
      fnNewDocument();
    }, () => { setLoading(false) });
  }

  const fnGetData = () => {

    request.getJSON("admin/users/getSellers", {}, (resp) => {
      const { data } = resp;
      setSellerList(data.map(elem => ({ id: elem.id, name: `${elem.sellerCode} - ${elem.name}` })));
    });

    request.GET('inventory/settings/stores?type=1', (resp) => {
      setStoreList(resp.data);
    }, () => { });

    // Formas de pago de facturación (uso 1 o 3), con el privilegio de esta pantalla.
    request.GET(`${ORDERS_URL}/paymentTypes`, (resp) => {
      setPaymentTypeList(resp.data);
    }, () => { });

    // Permiso de editar precio, límite de edición y control de lote y fecha: se guardan en memoria al entrar a la pantalla.
    request.GET(`${ORDERS_URL}/settings`, (resp) => {
      setSettings({ ...NO_SETTINGS, ...resp.data });
    }, () => { });

    request.GET('admin/companies/getOperationalSettings', (resp) => {
      setDateFormat(resp.data.formatDate || 'DMY');
    }, () => { });
  }

  const fnNewCustomer = () => {
    setOpenNewCustomer(true);
  }

  const fnSeekCustomerList = () => setOpenSeekCustomer(true);

  const fnOkDeleteItem = () => {
    setOpenMsgDeleteItem(false);
    if (itemToDelete === '') return;
    setDataDetails(dataDetails.filter(item => item.tempCode !== itemToDelete));
  }

  const fnCancelDeleteItem = () => {
    setItemToDelete('');
  }

  // La orden exige un cliente CREADO: sus datos se copian a la orden (se pueden corregir a mano, pero `customerId` solo cambia eligiendo otro).
  const setSelectedCustomer = (customer) => {
    const { id: customerId, nomcli, rtn, tel, purchaseContactEmail, direcc } = customer;
    onBulkForm({ ...formState, customerId, customerCode: rtn, customerName: nomcli, customerPhone: tel || '', customerAddress: direcc || '', customerEmail: purchaseContactEmail || '' })
    setOpenSeekCustomer(false);
  }

  const fnSelectProduct = (product) => {
    setOpenSeekProducts(false);
    setIsEditItem(false);
    setCurrentProduct(lineFromProduct(product, RandomCodeGenerator()));
    setOpenEditCurrentProduct(true);
  }

  const fnSaveCurrentItem = (currentItem) => {
    setOpenEditCurrentProduct(false);
    setDataDetails(isEditItem
      ? dataDetails.map((line) => (line.tempCode === currentItem.tempCode ? currentItem : line))
      : [...dataDetails, currentItem]);
  }

  // Igual que Textbox_hw8.KeyPress del legacy: sin almacén seleccionado se cotiza contra el catálogo general (view_stock_for_quotes); con almacén se usa el buscador del POS.
  const fnAddItem = () => {
    if (isLocked) {
      notification('warning', 'page.billingPurchaseOrders.msg.locked', 'alert.warning.title');
      return;
    }
    setIsEditItem(false);

    if (validInt(formState.storeId) === 0) {
      request.GET(`inventory/process/stocks/getStockForQuotes`, (resp) => {
        const products = resp.data.map((item) => {
          item.name = item.productName;
          item.unitProd = item.undoutName;
          item.options = <TableButtons color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
          return item;
        });
        setListProducts(products);
        setOpenSeekProducts(true);
        setLoading(false);
      }, () => {
        setLoading(false);
      });
      return;
    }

    const mapProduct = (item) => {
      const currProduct = {
        productCode: item.productCode,
        productName: item.productName,
        undoutId: item.undoutId,
        undoutName: item.undoutName,
        valChange: item.valChange,
        min: item.localMinPrice,
        med: item.localMedPrice,
        max: item.localMaxPrice,
        percentTax: item.percentTax,
        includeTaxPrice: !!item.priceIncludeTax,
        stock: item.qtyStock
      };
      currProduct.name = currProduct.productName;
      currProduct.unitProd = currProduct.undoutName;
      currProduct.options = <TableButtons color='primary' icon='eye' fnOnClick={() => fnSelectProduct(currProduct)} />
      return currProduct;
    }

    request.GET(`inventory/process/stocks/getStocks?storeId=${formState.storeId}&inStock=true`, (resp) => {
      const products = resp.data.map(mapProduct);
      request.GET('inventory/process/stocks/getServices', (resp2) => {
        const services = resp2.data.map(mapProduct);
        setListProducts([...products, ...services]);
        setOpenSeekProducts(true);
        setLoading(false);
      }, () => {
        setListProducts(products);
        setOpenSeekProducts(true);
        setLoading(false);
      });
    }, () => {
      setLoading(false);
    });
  }

  // "Cotización" del ControlPanel (Controlpanelbtn2 del legacy): solo en una orden nueva; con datos pide confirmación. A diferencia del legacy (quote_id siempre en 0)
  // se guarda la cotización de origen.
  const fnSearchQuoteToLoad = () => {
    if (validInt(id) !== 0) {
      notification('warning', 'page.billingPurchaseOrders.msg.loadQuote.savedOrder', 'alert.warning.title');
      return;
    }
    setOpenSeekQuote(true);
  }

  // Una sola lectura (GET quotes/:id) trae la cabecera y las líneas; los nombres de las líneas ya son los de la orden.
  const fnLoadQuote = (row) => {
    setOpenSeekQuote(false);
    if (dataDetails.length > 0) {
      setPendingQuote(row);
      setOpenMsgLoadQuote(true);
      return;
    }
    fnApplyQuote(row);
  }

  const fnApplyQuote = (row) => {
    setOpenMsgLoadQuote(false);
    setLoading(true);
    request.GET(`billing/process/quotes/${row.id}`, ({ data }) => {
      onBulkForm({
        ...buildInitialForm(),
        date: formState.date,
        quoteId: data.id,
        customerId: data.customerId || 0,
        customerCode: data.customerCode || '',
        customerName: data.customerName || '',
        customerPhone: data.customerPhone || '',
        customerEmail: data.customerEmail || '',
        customerAddress: data.customerAddress || '',
        sellerId: data.sellerId || 0,
        storeId: data.storeId || 0,
        deliveryTime: data.deliveryTime || '',
        notes: data.notes || ''
      });
      setDataDetails((data.details || []).map(lineFromApi));
      setLoading(false);
      // La orden exige un cliente creado: si la cotización era para cualquier persona se abre el alta rápida (como el legacy).
      if (!(Number(data.customerId) > 0)) {
        notification('warning', 'page.billingPurchaseOrders.error.customer.required', 'alert.warning.title');
        setOpenNewCustomer(true);
      }
    }, () => {
      setLoading(false);
    });
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: screenControl.fnCreate || screenControl.fnUpdate ? fnSaveDocument : null,
    fnPrint: fnPrintDocument,
    // Eliminar exige fn_delete de la pantalla (01.03.031) y 11.01.007 (anular documentos): el back lo vuelve a validar.
    fnDelete: canDelete ? fnDeleteDocument : null,
    buttonsHome: [{
      title: "button.newCustomer",
      icon: "bi bi-person-plus",
      onClick: fnNewCustomer
    }, {
      title: "button.searchCustomer",
      icon: "bi bi-search",
      onClick: fnSeekCustomerList
    }, {
      title: "page.billingPurchaseOrders.button.loadQuote",
      icon: "bi bi-file-earmark-arrow-down",
      onClick: fnSearchQuoteToLoad
    }, {
      title: "button.sendEmail",
      icon: "bi bi-envelope",
      onClick: fnOpenSendEmail
    }],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    fnOnNo: () => { }
  };

  const propsToMsgLoadQuote = {
    title: "alert.question.title",
    open: openMsgLoadQuote,
    setOpen: setOpenMsgLoadQuote,
    fnOnOk: () => fnApplyQuote(pendingQuote),
    fnOnNo: () => setPendingQuote(null)
  };

  const propsToModalSeekDocuments = {
    ModalContent: ModalSeekPurchaseOrders,
    title: "menu.billingPurchaseOrders",
    open: openSeekDocument,
    setOpen: setOpenSeekDocument,
    maxWidth: 'lg',
    data: {
      fnViewItem: fnEditDocument,
      dateFormat
    }
  }

  const propsToModalSeekQuoteToLoad = {
    ModalContent: ModalSeekQuotes,
    title: "page.billingPurchaseOrders.modal.loadQuote.title",
    open: openSeekQuote,
    setOpen: setOpenSeekQuote,
    maxWidth: 'lg',
    data: {
      fnViewItem: fnLoadQuote,
      dateFormat,
      setLoading
    }
  }

  const propsToModalSeekCustomers = {
    ModalContent: ModalViewCust,
    title: "page.paymentMethods.radio.usageType.customers",
    open: openSeekCustomer,
    setOpen: setOpenSeekCustomer,
    maxWidth: 'lg',
    data: {
      fnViewItem: setSelectedCustomer,
      setLoading
    }
  }

  const propsToModalNewCustomer = {
    ModalContent: ModalNewCustomer,
    title: "button.newCustomer",
    open: openNewCustomer,
    setOpen: setOpenNewCustomer,
    maxWidth: 'md',
    data: {
      setLoading,
      setCustomer: setSelectedCustomer
    }
  }

  const propsToModalSeekProducts = {
    ModalContent: ModalProducts,
    title: "page.invoicing.modal.products.title",
    open: openSeekProducts,
    setOpen: setOpenSeekProducts,
    maxWidth: 'xl',
    setLoading,
    data: {
      setLoading,
      listProducts
    }
  }

  const propsToModalEditCurrentProduct = {
    ModalContent: ModalEditCurrentProduct,
    title: isEditItem ? "button.edit" : "button.addProduct",
    open: openEditCurrentProduct,
    setOpen: setOpenEditCurrentProduct,
    maxWidth: 'sm',
    data: {
      setLoading,
      currentItem: currentProduct,
      fnSave: fnSaveCurrentItem,
      canEditPrice: settings.canEditPrice
    }
  }

  const propsToMsgDeleteItem = {
    title: "alert.question.title",
    open: openMsgDeleteItem,
    textLegend: nameItemToDelete,
    setOpen: setOpenMsgDeleteItem,
    fnOnOk: fnOkDeleteItem,
    fnOnNo: fnCancelDeleteItem
  };

  const propsToModalSendEmail = {
    ModalContent: ModalSendEmail,
    title: "button.sendEmail",
    open: openSendEmail,
    setOpen: setOpenSendEmail,
    maxWidth: 'md',
    data: {
      setLoading,
      sendUrl: `${ORDERS_URL}/${id}/email`,
      documentId: id,
      attachmentName: `Orden de Compra_${id}.pdf`,
      defaultTo: formState.customerEmail,
      defaultSubject: `${IntlMessagesFn('page.billingPurchaseOrders.modal.sendEmail.defaultSubject')} ${id}`,
      defaultBody: IntlMessagesFn('page.billingPurchaseOrders.modal.sendEmail.defaultBody')
    }
  }

  useEffect(() => {
    fnGetData();
  }, [])

  return {
    formState,
    sellerList,
    storeList,
    paymentTypeList,
    isLocked,
    settings,
    errors,
    totals,
    onInputChange,
    onResetForm,
    onBulkForm,
    fnSaveDocument,
    sendForm,
    propsToMsgDelete,
    propsToMsgLoadQuote,
    propsToControlPanel,
    columnDetails,
    dataDetails: rows,
    fnAddItem,
    propsToModalSeekCustomers,
    propsToModalSeekDocuments,
    propsToModalSeekQuoteToLoad,
    propsToModalNewCustomer,
    propsToModalSeekProducts,
    propsToModalEditCurrentProduct,
    propsToMsgDeleteItem,
    propsToModalSendEmail
  }
}
