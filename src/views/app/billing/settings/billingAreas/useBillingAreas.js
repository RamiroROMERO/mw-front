import React, { useState, useEffect } from 'react';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import { validInt } from '@Helpers/Utils';

const useBillingAreas = ({ setLoading }) => {
  const companyData = JSON.parse(localStorage.getItem("mw_current_company"));
  const [tableData, setTableData] = useState([])
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [listDocument, setListDocument] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [isHospitalControl, setHospitalControl] = useState(companyData?.isHospitalControl || false);
  const [openModalViewDocument, setOpenModalViewDocument] = useState(false);

  const billingAreasValid = {
    name: [(val) => val.length > 5, "msg.required.input.description"],
    idStore: [(val) => validInt(val) > 0, "msg.required.input.idStore"],
    codeDocument: [(val) => val !== "", "msg.required.input.codeDocument"],
    localPriceType: [(val) => validInt(val) > 0, "msg.required.input.localPriceType"],
    outsiderPriceType: [(val) => validInt(val) > 0, "msg.required.input.localPriceType"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    idCtaIng: '',
    idCtaDiscount: '',
    idCtaTax: '',
    idCtaCxc: '',
    idCtaRrhhFourteenth: '',
    idCtaRrhhNotice: '',
    idCtaRrhhSeverance: '',
    idCtaRrhhThirteenth: '',
    idCtaRrhhVacation: '',
    idCtaFaCost: '',
    idCtaFaDeprec: '',
    idStore: 0,
    codeDocument: '',
    localPriceType: 0,
    outsiderPriceType: 0,
    useBilling: false,
    useRrhh: false,
    useFixedAssets: false,
    isHospital: false,
    isDefault: false,
    status: true
  }, billingAreasValid);

  const { id, name, idCtaIng, idCtaDiscount, idCtaTax, idCtaCxc, idStore, codeDocument, localPriceType, outsiderPriceType, useBilling, useRrhh, useFixedAssets, isHospital, idCtaRrhhFourteenth, idCtaRrhhNotice, idCtaRrhhSeverance, idCtaRrhhThirteenth, idCtaRrhhVacation, idCtaFaCost, idCtaFaDeprec, isDefault, status } = formState;

  const fnDeleteItem = (item) => {
    setBulkForm(item);
    setOpenMsgQuestion(true);
  }

  const fnNewDocument = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET('admin/areas', (resp) => {
      const { data } = resp
      setTableData(data);
      setOpenModalViewDocument(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const data = {
      name,
      idCtaIng,
      idCtaDiscount,
      idCtaTax,
      idCtaCxc,
      idStore,
      codeDocument,
      localPriceType,
      outsiderPriceType,
      isDefault,
      isHospital,
      useBilling, useRrhh, useFixedAssets, idCtaRrhhFourteenth, idCtaRrhhNotice, idCtaRrhhSeverance, idCtaRrhhThirteenth, idCtaRrhhVacation, idCtaFaCost, idCtaFaDeprec, status
    }
    if (id && id > 0) {
      setLoading(true);
      request.PUT(`admin/areas/${id}`, data, () => {
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/areas', data, () => {
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnViewDocument = (item) => {
    setBulkForm(item);
    setOpenModalViewDocument(false);
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnDelete: fnDeleteItem,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: [],
    disableTab: [false, true, true]
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    const data = {
      status: 0
    }
    if (id && id > 0) {
      setLoading(true);
      request.PUT(`admin/areas/${id}`, data, (resp) => {
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccount = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccount(listAccount);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET('inventory/settings/stores/getSL?type=1', (resp) => {
      const store = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(store);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setLoading(true);
    request.GET(`admin/documents/?useBill=1`, (resp) => {
      const documents = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.code
        }
      });
      setListDocument(documents);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToAreasDetail = {
    formState,
    onInputChange,
    listDocument,
    listLedgerAccount,
    listStores,
    sendForm,
    formValidation,
    isHospitalControl
  };

  return {
    tableData,
    openModalViewDocument,
    setOpenModalViewDocument,
    propsToControlPanel,
    propsToMsgDelete: {
      open: openMsgQuestion,
      setOpen: setOpenMsgQuestion,
      fnOnOk: fnDisableDocument,
      title: "alert.question.title"
    },
    propsToAreasDetail,
    fnViewDocument
  }
}

export default useBillingAreas;