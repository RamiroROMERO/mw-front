import { useEffect, useState } from 'react';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import moment from 'moment';
import { validInt } from '@/helpers/Utils';

export const useCreditNotes = ({ setLoading, setCreditNotesDetail, setCreditNotesDetail2 }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataCreditNotes, setDataCreditNotes] = useState([]);
  const [showDetail1, setShowDetail1] = useState("flex");
  const [showDetail2, setShowDetail2] = useState("none");
  const [showspecify, setShowSpecify] = useState("none");
  const [openModalUnpaidBill, setOpenModalUnpaidBill] = useState(false);
  const [openModalViewCreditNotes, setOpenModalViewCreditNotes] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validCreditNotes = {
    documentId: [(val) => val !== "", "msg.required.select.typeDocument"],
    valueLps: [(val) => validInt(val) > 0, "msg.required.input.value"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    total: [(val) => validInt(val) > 0, "msg.required.input.total"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: '',
    providerId: 0,
    providerCode: 0,
    providerRtn: '',
    providerName: '',
    concept: 1,
    specifyOther: '',
    notes: '',
    date: moment(new Date()).format("YYYY-MM-DD"),
    valueLps: 0,
    valueUsd: 0,
    exchangeRate: 0,
    percentDiscount: 0,
    accountId: 0,
    invoiceNum: '',
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  }, validCreditNotes);

  const fnNewDocument = () => {
    onResetForm();
    setShowDetail1("flex");
    setShowDetail2("none");
    setShowSpecify("none");
    setCreditNotesDetail([]);
    setCreditNotesDetail2([]);
    setSendForm(false);
  }

  const fnSearchDocument = () => {
    setOpenModalViewCreditNotes(true);
  }

  const fnGetDataDetail = () => { }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
  }

  const fnPrintDocument = () => { }

  const fnCancelDocument = () => { }

  const fnCount = () => { }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
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
          label: item.name,
          value: item.id,
          cai: item.cai,
          dni: item.dni
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccounts(listAccounts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnCancel: fnCancelDocument,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnCount
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      listDocuments,
      listProviders,
      listAccounts,
      onInputChange,
      onBulkForm,
      showDetail1,
      setShowDetail1,
      showDetail2,
      setShowDetail2,
      openModalUnpaidBill,
      setOpenModalUnpaidBill,
      showspecify,
      setShowSpecify,
      openModalViewCreditNotes,
      setOpenModalViewCreditNotes,
      dataCreditNotes,
      fnGetDataDetail,
      sendForm,
      formValidation
    }
  )
}
