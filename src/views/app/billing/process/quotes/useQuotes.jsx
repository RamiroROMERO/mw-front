import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@Hooks';
import { Button } from 'reactstrap';
import { IntlMessagesFn, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { RandomCodeGenerator } from '@Helpers/UuIdGenerator';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';
import ModalViewCust from '../customers/ModalViewCust';
import ModalProducts from '../invoicing/ModalProducts';
import { ModalEditCurrentProduct } from './ModalEditCurrentProduct';
import { ModalNewCustomer } from './ModalNewCustomer';
import ModalSeekQuotes from './ModalSeekQuotes';
import ModalSendEmail from './ModalSendEmail';
import { buildInitialForm, buildQuotePayload, calculateTotals, formFromQuote, isQuoteLocked, lineFromApi, lineFromProduct, productFromSearchRow, validateQuote } from './quoteRules';

const QUOTES_URL = 'billing/process/quotes';
const NO_SETTINGS = { canEditPrice: false, timeQuote: 0, limitDate: null, hasDateOutControl: false };

// Cotizaciones (fac_quotes.sc2). Guardar y eliminar son UNA llamada (el back guarda cabecera y líneas en una transacción y calcula los importes); la
// pantalla valida lo mismo que el back antes de llamar. Al entrar se consulta `GET quotes/settings` (permiso de editar precio, límite de edición y
// control de lote y fecha) y se guarda en memoria: una cotización más vieja que el límite se muestra de solo lectura y se avisa al cargarla, para no
// dejar hacer un trabajo de edición que al final fallaría por la fecha.
export const useQuotes = ({ setLoading, setActiveTab, screenControl = {}, canDelete = false }) => {

  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteItem, setOpenMsgDeleteItem] = useState(false);
  const [openSeekCustomer, setOpenSeekCustomer] = useState(false);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [openSeekProducts, setOpenSeekProducts] = useState(false);
  const [openEditCurrentProduct, setOpenEditCurrentProduct] = useState(false);
  const [openSeekDocument, setOpenSeekDocument] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [sellerList, setSellerList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [settings, setSettings] = useState(NO_SETTINGS);
  // Formato de fecha configurado por el Administrador (mw_setting.form_date) — DMY es el default del legacy cuando el ajuste viene vacío.
  const [dateFormat, setDateFormat] = useState('DMY');
  const [dataDetails, setDataDetails] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEditItem, setIsEditItem] = useState(false);

  const [itemToDelete, setItemToDelete] = useState('');
  const [nameItemToDelete, setNameItemToDelete] = useState('');

  const { formState, onInputChange, onResetForm, onBulkForm } = useForm(buildInitialForm());
  const { id } = formState;

  const isLocked = isQuoteLocked(formState, settings.timeQuote);
  const errors = useMemo(() => validateQuote(formState, dataDetails, { timeQuote: settings.timeQuote }), [formState, dataDetails, settings.timeQuote]);
  const totals = useMemo(() => calculateTotals(dataDetails), [dataDetails]);

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

  // Los botones se arman al pintar (no se guardan en el estado) y no existen en una cotización de solo lectura.
  const rows = useMemo(() => dataDetails.map((line) => ({
    ...line,
    buttons: isLocked ? null : (
      <>
        <Button type='button' color='outline-primary' className='btn-circle-table me-1' onClick={() => fnEditItem(line)}> <i className='bi bi-pencil' /> </Button>
        <Button type='button' color='outline-danger' className='btn-circle-table' onClick={() => fnDeleteItem(line.tempCode, line.productName)}> <i className='bi bi-trash' /> </Button>
      </>
    )
  })), [dataDetails, isLocked]);

  const loadQuote = (quote) => {
    const form = formFromQuote(quote);
    onBulkForm(form);
    setDataDetails((quote.details || []).map(lineFromApi));
    if (isQuoteLocked(form, settings.timeQuote)) notification('warning', 'page.quotes.msg.locked', 'alert.warning.title');
  }

  const fnEditDocument = (row) => {
    setOpenSeekDocument(false);
    setLoading(true);
    request.GET(`${QUOTES_URL}/${row.id}`, ({ data }) => {
      loadQuote(data);
      setSendForm(false);
      setLoading(false);
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
      notification('warning', 'page.quotes.msg.locked', 'alert.warning.title');
      return;
    }
    if (Object.keys(errors).length > 0) {
      // Los errores de las líneas no se ven en la pestaña de datos: se avisan aparte.
      if (errors.details) notification('warning', errors.details, 'alert.warning.title');
      return;
    }
    const payload = buildQuotePayload(formState, dataDetails);
    setLoading(true);
    if (validInt(id) === 0) {
      request.POST(QUOTES_URL, payload, ({ data }) => {
        onInputChange({ target: { name: 'id', value: data.id } });
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.PUT(`${QUOTES_URL}/${id}`, payload, () => setLoading(false), () => setLoading(false));
    }
  };

  const fnPrintDocument = () => {
    printDocument({ path: QUOTES_URL, id, fileName: 'Cotizacion.pdf', setLoading });
  }

  const fnDeleteDocument = () => {
    if (validInt(id) <= 0) return;
    if (isLocked) {
      notification('warning', 'page.quotes.msg.locked', 'alert.warning.title');
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

  // Una sola llamada: el back borra las líneas y la cotización en una transacción. Si lo rechaza (permiso, límite de edición) la cotización se queda.
  const fnDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`${QUOTES_URL}/${id}`, () => {
      setLoading(false);
      fnNewDocument();
    }, () => { setLoading(false) });
  }

  const fnGetData = () => {

    request.getJSON("admin/users/getSellers", {}, (resp) => {
      const { data } = resp;
      const currSellers = data.map(elem => {
        const currItem = {
          id: elem.id,
          name: `${elem.sellerCode} - ${elem.name}`
        }
        return currItem;
      });
      setSellerList(currSellers);
    });

    request.GET('inventory/settings/stores?type=1', (resp) => {
      setStoreList(resp.data);
    }, () => { });

    // Permiso de editar precio, límite de edición y control de lote y fecha: se guardan en memoria al entrar a la pantalla.
    request.GET(`${QUOTES_URL}/settings`, (resp) => {
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

  // Los datos del cliente se copian a la cotización: se pueden digitar a mano (una cotización puede ser para cualquier persona).
  const setSelectedCustomer = (customer) => {
    const { id: customerId, name, dni, phone, purchaseContactEmail, address } = customer;
    onBulkForm({ ...formState, customerId, customerCode: dni, customerName: name, customerPhone: phone, customerAddress: address, customerEmail: purchaseContactEmail || '' })
    setOpenSeekCustomer(false);
  }

  const fnSelectProduct = (row) => {
    const product = productFromSearchRow(row);
    setOpenSeekProducts(false);
    setIsEditItem(false);
    const line = lineFromProduct(product, RandomCodeGenerator());
    setCurrentProduct(line);
    setOpenEditCurrentProduct(true);
  }

  const fnSaveCurrentItem = (currentItem) => {
    setOpenEditCurrentProduct(false);
    setDataDetails(isEditItem
      ? dataDetails.map((line) => (line.tempCode === currentItem.tempCode ? currentItem : line))
      : [...dataDetails, currentItem]);
  }

  // Igual que Textbox_hw8.KeyPress del legacy: sin almacén seleccionado se cotiza contra
  // el catálogo general (sin existencia real, view_stock_for_quotes); con almacén
  // seleccionado se usa el mismo buscador de productos que el POS, filtrado por esa bodega.
  const fnAddItem = () => {
    if (isLocked) {
      notification('warning', 'page.quotes.msg.locked', 'alert.warning.title');
      return;
    }
    setIsEditItem(false);
    setOpenSeekProducts(true);
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: screenControl.fnCreate || screenControl.fnUpdate ? fnSaveDocument : null,
    fnPrint: fnPrintDocument,
    // Eliminar exige fn_delete de la pantalla (01.02.011) y 99.20.004 (anular documentos): el back lo vuelve a validar.
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

  const propsToModalSeekDocuments = {
    ModalContent: ModalSeekQuotes,
    title: "menu.quotes",
    open: openSeekDocument,
    setOpen: setOpenSeekDocument,
    maxWidth: 'lg',
    data: {
      fnViewItem: fnEditDocument,
      dateFormat
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
      storeId: validInt(formState.storeId),
      url: `${QUOTES_URL}/products`,
      fnSelect: fnSelectProduct
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
      canEditPrice: settings.canEditPrice,
      hasDateOutControl: settings.hasDateOutControl
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
      sendUrl: `${QUOTES_URL}/${id}/email`,
      documentId: id,
      attachmentName: `Cotizacion_${id}.pdf`,
      defaultTo: formState.customerEmail,
      defaultSubject: `${IntlMessagesFn('page.quotes.modal.sendEmail.defaultSubject')} ${id}`,
      defaultBody: IntlMessagesFn('page.quotes.modal.sendEmail.defaultBody')
    }
  }

  useEffect(() => {
    fnGetData();

  }, [])

  return {
    formState,
    sellerList,
    storeList,
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
    propsToControlPanel,
    columnDetails,
    dataDetails: rows,
    fnAddItem,
    propsToModalSeekCustomers,
    propsToModalSeekDocuments,
    propsToModalNewCustomer,
    propsToModalSeekProducts,
    propsToModalEditCurrentProduct,
    propsToMsgDeleteItem,
    propsToModalSendEmail
  }
}
