import React, { useState, useEffect } from 'react'
import { useForm } from '@/hooks'
import { request } from '@/helpers/core';
import { validInt } from '@/helpers/Utils';

const useDiscounts = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const discountValidations = {
    name: [(val) => val.length > 5, "msg.required.input.description"],
    percentValue: [(val) => validInt(val) > 0 && validInt(val) <= 100, "msg.required.input.amount"],
    idCtaAccount: [(val) => validInt(val) > 0, "msg.required.input.account"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: "",
    percentValue: 0,
    idCtaAccount: "",
    status: true
  }, discountValidations);

  const { id, name, percentValue, idCtaAccount } = formState;

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setBulkForm(item);
    setOpenMsgQuestion(true);
  }

  const fnClearInputs = () => {
    setCurrentItem({});
    setSendForm(false);
    onResetForm();
  }

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setSendForm(false);
    setBulkForm(item);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/discounts', (resp) => {
      const data = resp.data.map((item) => {
        item.description = item.name
        item.amount = item.percentValue
        return item;
      });
      setTableData(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  };

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    const data = {
      name,
      percentValue,
      idCtaAccount
    }
    if (currentItem && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`admin/discounts/${currentItem.id}`, data, (resp) => {
        console.log(resp);
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/discounts', data, (resp) => {
        console.log(resp);
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (id && id > 0) {
      setLoading(true);
      request.PUT(`admin/discounts/${currentItem.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccount = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccount(listAccount);
      setLoading(false);
      fnGetData();
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return {
    ...formState, ...formValidation,
    formState,
    formValidation,
    isFormValid,
    sendForm,
    onInputChange,
    fnClearInputs,
    setBulkForm,
    tableData,
    propsToMsgDelete,
    fnSave,
    listLedgerAccount,
    fnEditItem,
    fnDeleteItem
  };
}

export default useDiscounts;