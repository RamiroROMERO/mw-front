import { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { Button } from 'reactstrap';
import { IntlMessagesFn, validFloat, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { RandomCodeGenerator } from '@Helpers/UuIdGenerator';
import { API_URLS } from '@Helpers/APIUrl';
import TableButtons from '@Components/tableButtons';
import ModalViewCust from '../customers/ModalViewCust';
import ModalProducts from '../invoicing/ModalProducts';
import { ModalEditCurrentProduct } from './ModalEditCurrentProduct';
import { ModalNewCustomer } from './ModalNewCustomer';
import ModalSeekQuotes from './ModalSeekQuotes';
import ViewPdf from '@/components/ViewPDF/ViewPdf';

export const useQuotes = ({ setLoading, setActiveTab }) => {

  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteItem, setOpenMsgDeleteItem] = useState(false);
  const [openSeekCustomer, setOpenSeekCustomer] = useState(false);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [openSeekProducts, setOpenSeekProducts] = useState(false);
  const [openEditCurrentProduct, setOpenEditCurrentProduct] = useState(false);
  const [openSeekDocument, setOpenSeekDocument] = useState(false);
  const [sellerList, setSellerList] = useState([]);
  const [dataDetails, setDataDetails] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [dataSeekDocument, setDataSeekDocument] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEditItem, setIsEditItem] = useState(false);

  const [itemToDelete, setItemToDelete] = useState('');
  const [nameItemToDelete, setNameItemToDelete] = useState('');

  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");

  useEffect(() => {

    const currTotals = dataDetails.reduce((acc, curr) => {
      acc.subtotal += validFloat(curr.subtotal);
      acc.discount += validFloat(curr.discountValue);
      acc.exempt += validFloat(curr.taxValue) === 0 ? (validFloat(curr.subtotal) - validFloat(curr.discountValue)) : 0;
      acc.taxed += validFloat(curr.taxValue) !== 0 ? (validFloat(curr.subtotal) - validFloat(curr.discountValue)) : 0;
      acc.tax += validFloat(curr.taxValue);
      acc.total += validFloat(curr.total);
      return acc;
    }, {
      subtotal: 0,
      discount: 0,
      exonerated: 0,
      exempt: 0,
      taxed: 0,
      tax: 0,
      total: 0
    });
    onBulkForm({
      subtotal: currTotals.subtotal,
      discount: currTotals.discount,
      exoneratedValue: currTotals.exonerated,
      exemptValue: currTotals.exempt,
      taxedValue: currTotals.taxed,
      tax: currTotals.tax,
      total: currTotals.total
    })
  }, [dataDetails])

  const validation = {
    date: [(val) => val.length > 0, IntlMessagesFn("page.common.validation.date")],
    sellerId: [val => validInt(val) > 0, IntlMessagesFn("msg.required.select.seller")],
    customerName: [val => val.length > 0, IntlMessagesFn("page.common.validation.customerName")],
    phone: [val => val.length > 0, IntlMessagesFn("page.common.validation.phone")],
    total: [val => validFloat(val) > 0, IntlMessagesFn("page.common.validation.total")]
  };

  const columnDetails = [
    { title: 'input.code', field: 'productCode', width: 15 },
    { title: 'input.name', field: 'productName', width: 40 },
    { title: 'input.outputUnit', field: 'unitProd', width: 15 },
    { title: 'input.qty', field: 'qty', width: 10, type: 'number' },
    { title: 'input.price', field: 'price', width: 10, type: 'currency', prefix: 'L. ' },
    { title: 'input.subtotal', field: 'subtotal', width: 15, type: 'currency', prefix: 'L. ' },
    { title: 'table.column.options', field: 'buttons', width: 15 },
  ]

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
    status: true
  }, validation);

  const { id } = formState;

  const fnEditDocument = (row) => {
    setOpenSeekDocument(false);
    onBulkForm(row);
    setLoading(true);
    const { id } = row;
    request.GET(`${API_URLS.FAC_PROC_QUOTES_DETAIL}?idFather=${id}`, ({ data }) => {
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
    setActiveTab("1")
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(API_URLS.FAC_PROC_QUOTES, ({ data }) => {
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
      request.POST(API_URLS.FAC_PROC_QUOTES, formState, ({ data }) => {
        setLoading(false);
        const { id: newId } = data;
        onInputChange({ target: { name: 'id', value: newId } });
        const saveDataDetails = dataDetails.map(elem => {
          elem.idFather = newId;
          return elem;
        });

        for (let i = 0; i < saveDataDetails.length; i++) {
          const elem = saveDataDetails[i];
          request.POST(API_URLS.FAC_PROC_QUOTES_DETAIL, elem, (data) => { }, err => { }, false);
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
      request.PUT(`${API_URLS.FAC_PROC_QUOTES}${id}`, formState, () => {
        request.DELETE(`${API_URLS.FAC_PROC_QUOTES_DETAIL}?idFather=${id}`, () => {
          for (let i = 0; i < saveDataDetails.length; i++) {
            const elem = saveDataDetails[i];
            request.POST(API_URLS.FAC_PROC_QUOTES_DETAIL, elem, (data) => { }, err => { }, false);
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
    request.GETPdfUrl('billing/process/quotes/exportPDF', { id }, (resp) => {
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

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`${API_URLS.FAC_PROC_QUOTES_DETAIL}?idFather=${id}`, () => { setLoading(false) }, () => { setLoading(false) }, false);
    request.DELETE(`${API_URLS.FAC_PROC_QUOTES}${id}`, () => { }, () => { setLoading(false) }, true);
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

  const fnAddItem = () => {

    request.GET(`inventory/process/stocks/getStockForQuotes`, (resp) => {
      const products = resp.data.map((item) => {
        item.name = item.productName;
        item.unitProd = item.undoutName;
        item.options = <TableButtons color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
        return item;
      });
      setIsEditItem(false);
      setListProducts(products);
      setOpenSeekProducts(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [{
      title: "button.newCustomer",
      icon: "bi bi-person-plus",
      onClick: fnNewCustomer
    }, {
      title: "button.searchCustomer",
      icon: "bi bi-search",
      onClick: fnSeekCustomerList
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
      dataQuotes: dataSeekDocument,
      fnViewItem: fnEditDocument,
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

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.quote",
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
    onInputChange,
    onResetForm,
    onBulkForm,
    formValidation,
    isFormValid,
    fnSaveDocument,
    // table,
    sendForm,
    propsToMsgDelete,
    propsToControlPanel,
    columnDetails,
    dataDetails,
    fnAddItem,
    propsToModalSeekCustomers,
    propsToModalSeekDocuments,
    propsToModalNewCustomer,
    propsToModalSeekProducts,
    propsToModalEditCurrentProduct,
    propsToMsgDeleteItem,
    propsToViewPDF
  }
}
