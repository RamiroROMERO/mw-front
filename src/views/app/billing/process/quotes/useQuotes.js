import React, { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { IntlMessages, IntlMessagesFn, validFloat, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useQuotes = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [dataDetails, setDataDetails] = useState([]);

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
    { title: 'input.qty', field: 'qty', width: 10 },
    { title: 'input.price', field: 'price', width: 10 },
    { title: 'input.subtotal', field: 'subtotal', width: 15 },
  ]

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    date: "",
    customerId: 0,
    customerCode: "",
    customerName: "",
    phone: "",
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

  }

  const fnSearchCustomer = () => {

  }

  const fnAddItem = () => {
    const newItem = {
      productCode: '2023983',
      productName: 'Producto nuevo',
      qty: 4,
      price: 120.30,
      subtotal: 481.20,
      discount: 0,
      exoneratedValue: 0,
      exemptValue: 0,
      taxPercent: 15,
      taxedValue: 481.20,
      taxValue: 72.18,
      total: 553.38,
      isExonerated: false
    }
    setDataDetails([...dataDetails, newItem]);
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
      onClick: fnSearchCustomer
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
    fnAddItem
  }
}
