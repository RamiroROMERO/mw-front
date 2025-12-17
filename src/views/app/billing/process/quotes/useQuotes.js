import React, { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { IntlMessages, IntlMessagesFn, validFloat, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import ModalViewCust from '../customers/ModalViewCust';
import { data } from 'react-router-dom';
import { ModalNewCustomer } from './ModalNewCustomer';
import ModalProducts from '../invoicing/ModalProducts';
import TableButtons from '@/components/tableButtons';

export const useQuotes = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [dataDetails, setDataDetails] = useState([]);
  const [openSeekCustomer, setOpenSeekCustomer] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [openNewCustomer, setOpenNewCustomer] = useState(false);
  const [openSeekProducts, setOpenSeekProducts] = useState(false);
  const [listProducts, setListProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});
  const [openEditCurrentProduct, setOpenEditCurrentProduct] = useState(false);
  const [isEditItem, setIsEditItem] = useState(false);

  const validation = {
    date: [(val) => val.length > 0, IntlMessagesFn("page.common.validation.date")],
    customerName: [val => val.length > 0, IntlMessagesFn("page.common.validation.customerName")],
    phone: [val => val.length > 0, IntlMessagesFn("page.common.validation.phone")],
    total: [val => validFloat(val) > 0, IntlMessagesFn("page.common.validation.total")]
  };

  const columnDetails = [
    { title: 'input.code', field: 'productCode', width: 15 },
    { title: 'input.name', field: 'productName', width: 40 },
    { title: 'input.outputUnit', field: 'um', width: 15 },
    { title: 'input.qty', field: 'qty', width: 10, type: 'number' },
    { title: 'input.price', field: 'price', width: 10, type: 'currency', prefix: 'L. ' },
    { title: 'input.subtotal', field: 'subtotal', width: 15, type: 'currency', prefix: 'L. ' },
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
    sellerId: "",
    notes: "",
    condDeliveryTime: "",
    condPaymentMethod: "",
    subtotal: 0,
    discount: 0,
    exoneratedValue: 0,
    exemptValue: 0,
    taxedValue: 0,
    tax: 0,
    total: 0
  }, validation);

  const { id } = formState;

  const fnEditDocument = (row) => {
    onBulkForm(row);
  }

  const fnNewDocument = () => {
    onResetForm();
  }

  const fnSearchDocument = () => {
    console.log('search');
  }

  const fnSaveDocument = () => {
    setLoading(true);
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if (validInt(id) === 0) {
      request.POST('', formState, () => {
        setLoading(false);
        fnGetTableData();
        onResetForm();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`/${id}`, formState, () => {
        setLoading(false);
        fnGetTableData();
        onResetForm();
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  };

  const fnPrintDocument = () => {
    console.log('print document!');
  }

  const fnDeleteDocument = (row) => {
    onBulkForm(row);
    setOpenMsgQuestion(true);
  };

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`/${id}`, () => {
      setLoading(false);
      onResetForm();
      fnGetTableData();
    }, (err) => {
      setLoading(false);
    });
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
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetData = () => {

    request.getJSON("accounting/settings/accountants/getSL", {}, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.cta;
        item.label = `${item.cta}-${item.nombre}`;
        return item;
      });
      setAccountList(list);
    });
  }

  const fnGetTableData = () => {
    setLoading(true);
    request.GET('fixedAssets/settings/types', (resp) => {
      const { data } = resp;
      setTableData(data);
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  const fnNewCustomer = () => {
    setOpenNewCustomer(true);
  }

  const setSelectedCustomer = (customer) => {
    const { id, nomcli, rtn, tel, correoc, direcc } = customer;
    onBulkForm({ ...formState, customerId: id, customerCode: rtn, customerName: nomcli, phone: tel, address: direcc, email: correoc })
    setOpenSeekCustomer(false);
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
      currProduct = {
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
        total: validFloat(currPrice + currTaxValue, 2)
      }
      setCurrentProduct(currProduct);
    }
    setOpenEditCurrentProduct(true);

    // console.log({ product });
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
      console.error(err);
      setLoading(false);
    });

    // setDataDetails([...dataDetails, newItem]);
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.fixedAssets.types"),
    columns: [
      { text: IntlMessages("input.code"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("input.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("check.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '20%' } }
    ],
    data: tableData,
    options: {
      columnActions: 'options'
    },
    actions: [{
      color: 'primary',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDeleteDocument,
      icon: 'trash'
    }],
  });

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
    fnOnNo: onResetForm
  };

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

  useEffect(() => {
    fnGetData();
    fnGetTableData();
  }, [])


  return {
    formState,
    accountList,
    onInputChange,
    onResetForm,
    onBulkForm,
    formValidation,
    isFormValid,
    fnSaveDocument,
    table,
    sendForm,
    propsToMsgDelete,
    propsToControlPanel,
    columnDetails,
    dataDetails,
    fnAddItem,
    propsToModalSeekCustomers,
    propsToModalNewCustomer,
    propsToModalSeekProducts
  }
}
