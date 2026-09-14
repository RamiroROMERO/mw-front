import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { Button } from 'reactstrap';
import { IntlMessagesFn, validFloat, validInt } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import { RandomCodeGenerator } from '@Helpers/UuIdGenerator';
import { API_URLS } from '@Helpers/APIUrl';
import DateHelper from '@Helpers/DateHelper';
import TableButtons from '@Components/tableButtons';
import ModalViewCust from '../customers/ModalViewCust';
import ModalProducts from '../invoicing/ModalProducts';
import ModalSeekQuotes from '../quotes/ModalSeekQuotes';
import { ModalEditCurrentProduct } from './ModalEditCurrentProduct';
import { ModalNewCustomer } from './ModalNewCustomer';
import ModalSeekPurchaseOrders from './ModalSeekPurchaseOrders';
import ModalSendEmail from './ModalSendEmail';
import ViewPdf from '@Components/ViewPDF/ViewPdf';

export const usePurchaseOrders = ({ setLoading, setActiveTab, screenControl = {} }) => {

  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteItem, setOpenMsgDeleteItem] = useState(false);
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
  // Tiempo límite (en días) para poder seguir editando la fecha de una orden ya
  // guardada — equivalente a nTimeOutQuote del legacy (time_quote en mw_setting).
  const [timeQuote, setTimeQuote] = useState(0);
  const [isDateEditable, setIsDateEditable] = useState(true);
  // Formato de fecha configurado por el Administrador (mw_setting.form_date) — DMY es
  // el default del legacy cuando el ajuste viene vacío.
  const [dateFormat, setDateFormat] = useState('DMY');
  const [dataDetails, setDataDetails] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [dataSeekDocument, setDataSeekDocument] = useState([]);
  const [dataSeekQuote, setDataSeekQuote] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEditItem, setIsEditItem] = useState(false);

  const [itemToDelete, setItemToDelete] = useState('');
  const [nameItemToDelete, setNameItemToDelete] = useState('');

  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  const validation = {
    date: [(val) => val.length > 0, IntlMessagesFn("page.common.validation.date")],
    sellerId: [val => validInt(val) > 0, IntlMessagesFn("msg.required.select.seller")],
    paymentTypeId: [val => validInt(val) > 0, IntlMessagesFn("msg.required.select.paymentType")],
    customerName: [val => val.length > 0, IntlMessagesFn("page.common.validation.customerName")],
    phone: [val => val.length > 0, IntlMessagesFn("page.common.validation.phone")],
    total: [val => validFloat(val) > 0, IntlMessagesFn("page.common.validation.total")]
  };

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    date: "",
    customerId: 0,
    customerCode: "",
    customerName: "",
    phone: "",
    email: "",
    address: "",
    sellerId: 0,
    storeId: 0,
    paymentTypeId: 0,
    condDeliveryTime: "",
    condPaymentMethod: "",
    notes: "",
    subtotal: 0,
    discount: 0,
    exoneratedValue: 0,
    exemptValue: 0,
    taxedValue: 0,
    tax: 0,
    total: 0,
    quoteId: 0,
    isExonerated: false,
    numberExonerated: "",
    status: true
  }, validation);

  const { id, isExonerated } = formState;

  useEffect(() => {

    const currTotals = dataDetails.reduce((acc, curr) => {
      acc.subtotal += validFloat(curr.subtotal);
      acc.discount += validFloat(curr.discountValue);
      const netLine = validFloat(curr.subtotal) - validFloat(curr.discountValue);
      if (validFloat(curr.taxValue) === 0) {
        acc.exempt += netLine;
      } else {
        acc.taxed += netLine;
        acc.tax += validFloat(curr.taxValue);
      }
      return acc;
    }, {
      subtotal: 0,
      discount: 0,
      exempt: 0,
      taxed: 0,
      tax: 0
    });

    // Igual que fncalculatetotal del legacy: si "Orden Exonerada" está marcada, el monto
    // gravado completo se mueve a Exonerado y el impuesto queda en 0.
    const exonerated = isExonerated ? currTotals.taxed : 0;
    const taxed = isExonerated ? 0 : currTotals.taxed;
    const tax = isExonerated ? 0 : currTotals.tax;

    onBulkForm({
      subtotal: currTotals.subtotal,
      discount: currTotals.discount,
      exoneratedValue: exonerated,
      exemptValue: currTotals.exempt,
      taxedValue: taxed,
      tax,
      total: currTotals.exempt + taxed + tax + exonerated
    })
  }, [dataDetails, isExonerated])

  const columnDetails = [
    { title: 'input.code', field: 'productCode', width: 15 },
    { title: 'input.name', field: 'productName', width: 40 },
    { title: 'input.outputUnit', field: 'unitProd', width: 15 },
    { title: 'input.qty', field: 'qty', width: 10, type: 'number' },
    { title: 'input.price', field: 'price', width: 10, type: 'currency', prefix: 'L. ' },
    { title: 'input.subtotal', field: 'subtotal', width: 15, type: 'currency', prefix: 'L. ' },
    { title: 'table.column.options', field: 'buttons', width: 15 },
  ]

  const fnEditDocument = (row) => {
    setOpenSeekDocument(false);
    onBulkForm(row);
    // Igual que el legacy (Textbox_hw2.Enabled = .F. si la fecha es más vieja que
    // nTimeOutQuote días): pasado ese límite ya no se puede correr la fecha del documento.
    setIsDateEditable(timeQuote <= 0 || !DateHelper.isBefore(row.date, DateHelper.subtract(DateHelper.now(), timeQuote, 'day')));
    setLoading(true);
    const { id } = row;
    request.GET(buildUrl(`${API_URLS.FAC_PROC_PURCHASE_ORDERS_DETAIL}`, { idFather: id }), ({ data }) => {
      const currentData = data.map(elem => {
        elem.productName = elem.productData?.name || "";
        elem.unitProd = elem.undOutData?.name || "";
        elem.buttons = fnAddButtonDeleteToItem(elem.tempCode, elem);
        return elem;
      });
      setDataDetails(currentData);
      setLoading(false);
    }, err => {
      setDataDetails([]);
      setLoading(false);
    });
  }

  const fnNewDocument = () => {
    setSendForm(false);
    onResetForm();
    setDataDetails([]);
    setIsDateEditable(true);
    setActiveTab("1")
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(API_URLS.FAC_PROC_PURCHASE_ORDERS, ({ data }) => {
      setDataSeekDocument(data);
      setOpenSeekDocument(true);
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    setLoading(true);
    if (validInt(id) === 0) {
      request.POST(API_URLS.FAC_PROC_PURCHASE_ORDERS, formState, ({ data }) => {
        setLoading(false);
        const { id: newId } = data;
        onInputChange({ target: { name: 'id', value: newId } });
        const saveDataDetails = dataDetails.map(elem => {
          elem.idFather = newId;
          return elem;
        });

        for (let i = 0; i < saveDataDetails.length; i++) {
          const elem = saveDataDetails[i];
          request.POST(API_URLS.FAC_PROC_PURCHASE_ORDERS_DETAIL, elem, (data) => { }, err => { }, false);
        }
        setLoading(false);
      }, (err) => {
        setLoading(false);
      })
    } else {
      const saveDataDetails = dataDetails.map(elem => {
        elem.idFather = id;
        return elem;
      });
      request.PUT(`${API_URLS.FAC_PROC_PURCHASE_ORDERS}${id}`, formState, () => {
        request.DELETE(buildUrl(`${API_URLS.FAC_PROC_PURCHASE_ORDERS_DETAIL}`, { idFather: id }), () => {
          for (let i = 0; i < saveDataDetails.length; i++) {
            const elem = saveDataDetails[i];
            request.POST(API_URLS.FAC_PROC_PURCHASE_ORDERS_DETAIL, elem, (data) => { }, err => { }, false);
          }
        }, () => { }, false);
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  };

  const fnPrintDocument = () => {
    if (validInt(id) <= 0) return;
    request.GETPdfUrl('billing/process/purchaseOrders/exportPDF', { id }, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDeleteDocument = () => {
    if (validInt(id) <= 0) return;
    setOpenMsgQuestion(true);
  };

  const fnOpenSendEmail = () => {
    if (validInt(id) <= 0) return;
    setOpenSendEmail(true);
  };

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(buildUrl(`${API_URLS.FAC_PROC_PURCHASE_ORDERS_DETAIL}`, { idFather: id }), () => { setLoading(false) }, () => { setLoading(false) }, false);
    request.DELETE(`${API_URLS.FAC_PROC_PURCHASE_ORDERS}${id}`, () => { }, () => { setLoading(false) }, true);
    fnNewDocument();
  }

  const fnSeekCustomerList = () => {
    setLoading(true);
    request.GET('billing/settings/customers/', (resp) => {
      const data = resp.data.map((item) => {
        item.typeCustomer = item.customerTypeData ? item.customerTypeData.name : ""
        return item;
      });
      setCustomersList(data);
      setLoading(false);
      setOpenSeekCustomer(true);
    }, (err) => {

      setLoading(false);
    });
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
    }, (err) => { });

    request.GET('admin/paymentTypes/getForCustomers', (resp) => {
      setPaymentTypeList(resp.data);
    }, (err) => { });

    request.GET('admin/companies/getOperationalSettings', (resp) => {
      setTimeQuote(validInt(resp.data.timeQuote));
      setDateFormat(resp.data.formatDate || 'DMY');
    }, (err) => { });
  }

  const fnNewCustomer = () => {
    setOpenNewCustomer(true);
  }

  const fnDeleteItem = (code, nameItem) => {

    setItemToDelete(code);
    setNameItemToDelete(nameItem);
    setOpenMsgDeleteItem(true);
  }

  const fnOkDeleteItem = () => {

    setOpenMsgDeleteItem(false);
    if (itemToDelete === '') return;
    const currDetail = dataDetails.filter(item => item.tempCode !== itemToDelete);
    setDataDetails(currDetail);
  }

  const fnCancelDeleteItem = () => {
    setItemToDelete('');
  }

  const setSelectedCustomer = (customer) => {
    const { id, nomcli, rtn, tel, correoc, direcc } = customer;
    onBulkForm({ ...formState, customerId: id, customerCode: rtn, customerName: nomcli, phone: tel, address: direcc, email: correoc })
    setOpenSeekCustomer(false);
  }

  const fnAddButtonDeleteToItem = (tempCode, product) => {
    return <Button type='button' color='outline-danger' className='btn-circle-table' data-bs-toggle="tooltip" onClick={() => fnDeleteItem(tempCode, product.productName)}> <i className='bi bi-trash' /></Button>
  }

  const fnSelectProduct = (product) => {
    setOpenSeekProducts(false);
    setCurrentProduct(product);
    let currProduct = {};
    if (isEditItem) {
      setCurrentProduct(product);
    } else {
      let currPrice = validFloat(product.includeTaxPrice ? product.med / 1 + (validFloat(product.percentTax) !== 0 ? (validFloat(product.percentTax / 100)) : 0) : product.med, 2);
      let currTaxValue = validFloat(currPrice * (validFloat(product.percentTax) !== 0 ? (validFloat(product.percentTax / 100)) : 0), 2)
      let tempCode = RandomCodeGenerator(),
        currProduct = {
          tempCode,
          productCode: product.productCode,
          productName: product.productName,
          undOutId: product.undoutId,
          undOutName: product.undoutName,
          qtyDist: product.valChange,
          price: currPrice,
          qty: 1,
          subtotal: currPrice * 1,
          discountPercent: 0,
          discountValue: 0,
          taxPercent: product.percentTax,
          taxValue: currTaxValue,
          total: validFloat(currPrice + currTaxValue, 2),
          stock: product.stock,
          price1: product.min,
          price2: product.med,
          price3: product.max,
          ...product,
          buttons: fnAddButtonDeleteToItem(tempCode, product)
        }
      delete currProduct['options'];
      setCurrentProduct(currProduct);
    }
    setOpenEditCurrentProduct(true);

  }

  const fnSaveCurrentItem = (currentItem) => {

    setOpenEditCurrentProduct(false);
    setDataDetails([...dataDetails, currentItem]);
  }

  // Igual que Textbox_hw8.KeyPress del legacy: sin almacén seleccionado se cotiza contra
  // el catálogo general (sin existencia real, view_stock_for_quotes); con almacén
  // seleccionado se usa el mismo buscador de productos que el POS, filtrado por esa bodega.
  const fnAddItem = () => {
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
      }, (err) => {

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

    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId: formState.storeId, inStock: true }), (resp) => {
      const products = resp.data.map(mapProduct);
      request.GET('inventory/process/stocks/getServices', (resp2) => {
        const services = resp2.data.map(mapProduct);
        setListProducts([...products, ...services]);
        setOpenSeekProducts(true);
        setLoading(false);
      }, (err) => {
        setListProducts(products);
        setOpenSeekProducts(true);
        setLoading(false);
      });
    }, (err) => {

      setLoading(false);
    });

  }

  // Botón "Cotización" del ControlPanel: reemplaza al botón homónimo del legacy que
  // carga una cotización existente y vuelca sus datos a la Orden de Compra. A
  // diferencia del legacy (que guardaba nQuoteId siempre en 0, bug conocido), acá
  // sí se persiste el quoteId de origen.
  const fnSearchQuoteToLoad = () => {
    setLoading(true);
    request.GET(API_URLS.FAC_PROC_QUOTES, ({ data }) => {
      setDataSeekQuote(data);
      setOpenSeekQuote(true);
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const fnLoadQuote = (row) => {
    setOpenSeekQuote(false);
    const { id: quoteId } = row;
    onBulkForm({
      ...formState,
      quoteId,
      customerId: row.customerId,
      customerCode: row.customerCode,
      customerName: row.customerName,
      phone: row.phone,
      email: row.email,
      address: row.address,
      sellerId: row.sellerId,
      storeId: row.storeId,
      condDeliveryTime: row.condDeliveryTime,
      condPaymentMethod: row.condPaymentMethod,
      notes: row.notes
    });
    setLoading(true);
    request.GET(buildUrl(`${API_URLS.FAC_PROC_QUOTES_DETAIL}`, { idFather: quoteId }), ({ data }) => {
      const currentData = data.map(elem => {
        elem.productName = elem.productData?.name || "";
        elem.unitProd = elem.undOutData?.name || "";
        elem.buttons = fnAddButtonDeleteToItem(elem.tempCode, elem);
        return elem;
      });
      setDataDetails(currentData);
      setLoading(false);
    }, err => {
      setDataDetails([]);
      setLoading(false);
    });
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: screenControl.fnDelete ? fnDeleteDocument : null,
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

  const propsToModalSeekDocuments = {
    ModalContent: ModalSeekPurchaseOrders,
    title: "menu.billingPurchaseOrders",
    open: openSeekDocument,
    setOpen: setOpenSeekDocument,
    maxWidth: 'lg',
    data: {
      dataPurchaseOrders: dataSeekDocument,
      fnViewItem: fnEditDocument,
      dateFormat,
      setLoading
    }
  }

  const propsToModalSeekQuoteToLoad = {
    ModalContent: ModalSeekQuotes,
    title: "page.billingPurchaseOrders.modal.loadQuote.title",
    open: openSeekQuote,
    setOpen: setOpenSeekQuote,
    maxWidth: 'lg',
    data: {
      dataQuotes: dataSeekQuote,
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
      dataCustomers: customersList,
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
    title: "button.addProduct",
    open: openEditCurrentProduct,
    setOpen: setOpenEditCurrentProduct,
    maxWidth: 'sm',
    data: {
      setLoading,
      currentItem: currentProduct,
      fnSave: fnSaveCurrentItem
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
      sendUrl: 'billing/process/purchaseOrders/sendEmail',
      documentId: id,
      attachmentName: `Orden_Compra_${id}.pdf`,
      defaultTo: formState.email,
      defaultSubject: `${IntlMessagesFn('page.billingPurchaseOrders.modal.sendEmail.defaultSubject')} ${id}`,
      defaultBody: IntlMessagesFn('page.billingPurchaseOrders.modal.sendEmail.defaultBody')
    }
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.purchaseOrder",
    valueTitle: id,
    fullscreen: true,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
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
    isDateEditable,
    onInputChange,
    onResetForm,
    onBulkForm,
    formValidation,
    isFormValid,
    fnSaveDocument,
    sendForm,
    propsToMsgDelete,
    propsToControlPanel,
    columnDetails,
    dataDetails,
    fnAddItem,
    propsToModalSeekCustomers,
    propsToModalSeekDocuments,
    propsToModalSeekQuoteToLoad,
    propsToModalNewCustomer,
    propsToModalSeekProducts,
    propsToModalEditCurrentProduct,
    propsToMsgDeleteItem,
    propsToModalSendEmail,
    propsToViewPDF
  }
}
