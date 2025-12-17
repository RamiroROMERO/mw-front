import React, { useEffect, useState } from 'react'
import { IntlMessages, validFloat } from "@/helpers/Utils";
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';

const typesRetentionValid = {
  name: [(val) => val !== "", "msg.required.input.description"],
  value: [(val) => validFloat(val) !== 0, "msg.required.input.percent"],
  taxCode: [(val) => validFloat(val) !== 0, "msg.required.input.codeSar"],
  idCtaAccount: [(val) => val !== "" && val !== "0", "msg.required.input.IdCtaAccount"]
}

export const useTypeRetentions = ({ setLoading }) => {

  const [listAccount, setListAccount] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, setBulkForm, onResetForm } = useForm({
    id: 0,
    name: '',
    value: '',
    taxCode: '',
    idCtaAccount: '',
    status: true
  }, typesRetentionValid);

  const fnEditItem = (item) => {
    setBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.typesRetention.table.title"),
    columns: [
      { text: IntlMessages("page.typesRetention.table.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.typesRetention.table.idCtaAccount"), dataField: "idCtaAccount", headerStyle: { 'width': '35%' } }
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('tax/settings/withholdingTypes', (resp) => {
      const { data } = resp;
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const data = {
      ...formState
    }

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`tax/settings/withholdingTypes/${formState.id}`, data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('tax/settings/withholdingTypes', data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  };

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`tax/settings/withholdingTypes/${currentItem.id}`, data, () => {
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

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const account = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccount(account);
      setLoading(false);
      fnGetData();
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetData();
  }, []);


  return {
    formState,
    onInputChange,
    formValidation,
    fnClearInputs,
    fnSave,
    table,
    propsToMsgDelete,
    sendForm,
    listAccount
  }
}
