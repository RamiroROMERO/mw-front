import React, { useState, useEffect } from 'react'
import { useForm } from '@/hooks';
import { request } from '@/helpers/core';
import { formatDate, formatNumber, validInt } from '@/helpers/Utils';

export const useOtherPurchases = ({ setLoading }) => {

  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymentTypes] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [sendForm, setSendForm] = useState(false)
  const [openSearch, setOpenSearch] = useState(false);
  const [dataPurchases, setDataPurchases] = useState([])

  const purchasesValid = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    providerType: [(val) => validInt(val) > 0, "msg.required.radio.providerType"],
    cai: [(val) => val !== "", "msg.required.input.numInvoice"],
    numCai: [(val) => val !== "", "msg.required.input.numInvoice"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateOut: [(val) => val !== "", "msg.required.input.date"],
    typeDocto: [(val) => validInt(val) > 0, "msg.required.select.typePurchase"],
    noCtaExpense: [(val) => val !== "", "msg.required.select.typePurchase"],
    total: [(val) => validInt(val) > 0, "msg.required.input.total"],
  };

  const { formState, formValidation, isFormValid, onInputChange, onBulkForm, onResetForm } = useForm({
    id: 0,
    documentCode: "",
    documentId: 0,
    providerId: 0,
    paymentTypeId: 0,
    orderId: 0,
    cai: "",
    numCai: "",
    date: "",
    dateOut: "",
    typeDocto: 0,
    description: "",
    exemptedCertificate: "",
    exemptedNumber: "",
    exemptedRecord: "",
    isExpense: 1,
    cpaTaxed: 0,
    nameRequire: "",
    noCtaExpense: "",
    pdaNumber: 0,
    providerType: 0,
    reportId: 0,
    status: 0,
    subtotal: 0,
    discount: 0,
    exonera: 0,
    exent: 0,
    gravado: 0,
    tax: 0,
    freight: 0,
    otherCharges: 0,
    total: 0
  }, purchasesValid);

  const { id } = formState;

  const fnNewDocument = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchDocument = () => {

    setLoading(true);
    request.GET("inventory/process/purchases?isExpense=1",
      (resp) => {
        console.log(resp)
        const purchases = resp.data.map((item) => {
          item.provider = item.invProvider.name
          item.dateIn = formatDate(item.date)
          item.valueTotal = formatNumber(item.total)
          item.valueSubtotal = formatNumber(item.subtotal)
          item.valueDiscount = formatNumber(item.discount)
          item.valueTax = formatNumber(item.tax)
          return item;
        });
        setDataPurchases(purchases);
        setOpenSearch(true);
        setLoading(false);
      }, (err) => {
        setLoading(false);
        console.log(err);
      })

  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    setLoading(true)
    if (validInt(id) === 0) {
      request.POST("inventory/process/purchases", formState,
        (resp) => {
          setLoading(false);
          console.log(resp);
        },
        (err) => {
          setLoading(false);
          console.log(err);
        },
        true);
    } else {
      request.PUT(`inventory/process/purchases/${validInt(id)}`, formState,
        (resp) => {
          setLoading(false);
          console.log(resp);
        },
        (err) => {
          setLoading(false);
          console.log(err);
        },
        true);
    }
  }

  const fnPrintDocument = () => { }

  const fnDeleteDocument = () => { }

  const fnApplyCount = () => { }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnDelete: fnDeleteDocument,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnApplyCount
      },
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {

    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      documents.unshift({ value: '0', label: 'Seleccione' });
      setListDocuments(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          address: item.address,
          creditDays: item.creditDays,
          cai: item.cai,
          providerType: item.providerType
        }
      });
      providers.unshift({ value: '0', label: 'Seleccione' });
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
      filterPayments.unshift({ value: '0', label: 'Seleccione' });
      setListPaymentTypes(filterPayments);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('contAccountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      listAccounts.unshift({ value: '0', label: 'Seleccione' });
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

  }, [])

  return {
    listDocuments,
    listProviders,
    listPaymentTypes,
    listLedgerAccounts,
    formState,
    formValidation,
    onInputChange,
    setBulkForm: onBulkForm,
    sendForm,
    propsToControlPanel,
    openSearch,
    setOpenSearch,
    dataPurchases
  }
}
