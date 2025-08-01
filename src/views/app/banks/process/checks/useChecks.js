import React, { useState, useEffect } from 'react'
import { useForm } from '@/hooks'
import { validInt } from '@/helpers/Utils';
import { number } from 'prop-types';
import { request } from '@/helpers/core';

export const useChecks = ({ setLoading, setSendFormDetail, onResetFormDetail }) => {
  const [listDocto, setListDocto] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listProvider, setListProvider] = useState([]);
  const [listCustomer, setListCustomer] = useState([]);
  const listCurrencyName = [{ id: 1, name: "Lempiras" }, { id: 2, name: "Dolares" }];
  const listCityName = [{ id: 1, name: "Tegucigalpa" }, { id: 2, name: "San Perdro Sula" }];
  const [openModalViewChecks, setOpenModalViewChecks] = useState(false);
  const [openModalPrintCheck, setOpenModalPrintCheck] = useState(false);
  const [openModalViewRequest, setOpenModalViewRequest] = useState(false);
  const [openModalExpenses, setOpenModalExpenses] = useState(false);
  const [openModalAnticiped, setOpenModalAnticiped] = useState(false);
  const [openModalCxp, setOpenModalCxp] = useState(false);
  const [openModalCxc, setOpenModalCxc] = useState(false)
  const [dataChecks, setDataChecks] = useState([]);
  const [dataExpenses, setDataExpenses] = useState([]);
  const [sendForm, setSendForm] = useState(false);


  const validCheck = {
    documentId: [(val) => validInt(val > 0), "msg.required.select.typeDocument"],
    bankCode: [(val) => val != '', "msg.required.select.bank"],
    provider: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    currencyName: [(val) => val != '', "msg.required.select.currency"],
    type: [(val) => validInt(val) > 0, "msg.requiered.input.typeExchange"],
    numberCheck: [(val) => validInt(val) > 0, "msg.requiered.input.numberCheck"],
    valueUsd: [(val) => validInt(val) > 0, "msg.requiered.input.valueUsd"]
  }

  const { formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex, onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex } = useForm({
    id: 0,
    documentId: 0,
    document: 0,
    bankCode: '',
    NumberAccount: '',
    providerId: 0,
    numberCheck: 0,
    cantLetter: '',
    date: '',
    value: 0,
    valueUsd: 0,
    type: 0,
    currencyName: '',
    cityId: 0,
    requestId: 0,
    totalValue: 0,
    total: 0,
    diference: 0,
    customerId: 0,
    status: true
  }, validCheck)

  const { id, documentId, bankCode, providerId, numberCheck, cantLetter, date, value, valueUsd, type, currencyName, cityId, requestId, status, customerId, document, total, totalValue, diference, NumberAccount } = formStateIndex;

  const fnNewCheck = () => {
    setSendForm(false);
    setSendFormDetail(false);
    onResetFormIndex();
    onResetFormDetail();
  };

  const fnViewCheck = (data) => {
    setBulkFormIndex(data);

  }

  const fnSearchCheck = () => {
    setOpenModalViewChecks(true);
  }

  const fnRequest = () => {
    setOpenModalViewRequest(true)
  }

  const fnGeneratePrintCheck = () => {
    setOpenModalPrintCheck(true)
  }

  const fnPreview = () => { }

  const fnSaveCheck = () => {
    setSendForm(true)
    if (!isFormValidIndex) {
      return;
    }
  }
  const fnExpenses = () => {
    setOpenModalExpenses(true);
  }

  const fnAnticiped = () => {
    setOpenModalAnticiped(true);
  }

  const fnViewCxp = () => {
    setOpenModalCxp(true)
  }
  const fnViewCxc = () => {
    setOpenModalCxc(true)
  }
  const fnSaveCheckRequest = () => { }
  const fnPrintcheck = () => { }
  const fnDeleteCheck = () => { }

  const propsToControlPanel = {
    fnNew: fnNewCheck,
    fnSearch: fnSearchCheck,
    fnSave: fnSaveCheck,
    fnPrint: fnPrintcheck,
    fnDelete: fnDeleteCheck,
    buttonsHome: [
      {
        title: "button.checks",
        icon: "bi bi-cash-coin",
        onClick: fnGeneratePrintCheck
      },
      {
        title: "button.request",
        icon: "simple-icon-note",
        onClick: fnRequest
      },
      {
        title: "button.expenses",
        icon: "iconsminds-financial",
        onClick: fnExpenses
      },
      {
        title: "button.preview",
        icon: "bi bi-clock",
        onClick: fnAnticiped
      },
      {
        title: "button.cxp",
        icon: "iconsminds-coins",
        onClick: fnViewCxp
      },
      {
        title: "button.cxc",
        icon: "iconsminds-financial",
        onClick: fnViewCxc
      },
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1', (resp) => {
      const docto = resp.data.map((item) => {
        return {
          label: ` ${item.code} | ${item.name} `,
          value: item.id,
          documentId: item.codeInt,
          setTaxDocument: item.setTaxDocument
        }
      });
      setListDocto(docto);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('admin/bankList', (resp) => {
      const banks = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.name
        }
      })
      setListBanks(banks);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET(`inventory/process/providers?status=1`, (resp) => {
      const providerValue = resp.data.map((item) => {
        return {
          value: item.id,
          label: ` ${item.dni} | ${item.name}`,
        }
      });
      setListProvider(providerValue);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, [])

  return (
    {
      propsToControlPanel,
      formStateIndex,
      setBulkFormIndex,
      onInputChangeIndex,
      onResetFormIndex,
      listDocto,
      listBanks,
      listProvider,
      listCurrencyName,
      listCityName,
      listCustomer,
      openModalViewChecks,
      setOpenModalViewChecks,
      dataChecks,
      fnViewCheck,
      openModalPrintCheck,
      setOpenModalPrintCheck,
      openModalViewRequest,
      setOpenModalViewRequest,
      formValidationIndex,
      sendForm,
      openModalExpenses,
      setOpenModalExpenses,
      dataExpenses,
      openModalAnticiped,
      setOpenModalAnticiped,
      openModalCxc,
      setOpenModalCxc,
      openModalCxp,
      setOpenModalCxp,
    }
  )
}
