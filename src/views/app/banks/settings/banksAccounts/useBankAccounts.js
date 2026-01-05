import React, { useState, useEffect } from 'react'
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';

export const useBankAccounts = ({ setLoading }) => {
  const listCurrency = [{ id: "Dolares", name: "Dolares" }, { id: "Lempiras", name: "Lempiras" }];
  const [listAccount, setListAccount] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const bankAccountsValid = {
    code: [(val) => val !== "", "msg.required.input.codeAccount"],
    bankNumber: [(val) => val !== "", "msg.required.input.bankNumber"],
    name: [(val) => val !== "", "msg.required.input.descriptionAccount"],
    currentCheck: [(val) => val !== "", "msg.required.input.currentCheck"],
    ctaBank: [(val) => val !== "" && val !== "0", "msg.required.input.ctaBank"],
    ctaShortage: [(val) => val !== "" && val !== "0", "msg.required.input.ctaShortage"],
    ctaMissing: [(val) => val !== "" && val !== "0", "msg.required.input.ctaMissing"]
  }

  const { formState, formValidation, isFormValid, onInputChange, setBulkForm, onResetForm } = useForm({
    id: 0,
    code: '',
    status: true,
    bankNumber: '',
    name: '',
    currentCheck: '',
    ctaBank: '',
    currencyName: '',
    ctaShortage: '',
    ctaMissing: ''
  }, bankAccountsValid);

  const fnEditItem = (item) => {
    setBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.banksAccounts.table.title"),
    columns: [
      { text: IntlMessages("page.banksAccounts.table.code"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.banksAccounts.table.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("page.banksAccounts.table.status"), dataField: "status", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell',
        cell: ({ row }) => {
          return (row.original.status === 1 || row.original.status === true)
            ? <i className="medium-icon bi bi-check2-square" />
            : <i className="medium-icon bi bi-square" />
        }
      },

    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: 'button.edit',
      onClick: fnEditItem,
      title: IntlMessages('button.edit')
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnDeleteItem,
      title: IntlMessages('button.delete')
    }],
    options: {
      enabledActionButtons: true
    }

  });

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('banks/settings/banksAccounts', (resp) => {
      const { data } = resp;
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`banks/settings/banksAccounts/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('banks/settings/banksAccounts', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`banks/settings/banksAccounts/${currentItem.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

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
    }, (err) => {

      setLoading(false);
    });
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      formValidation,
      listAccount,
      listCurrency,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
