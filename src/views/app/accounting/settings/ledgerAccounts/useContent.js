import React, { useState, useEffect } from 'react'
import { IntlMessages } from "@/helpers/Utils";
import { validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';

export const useContent = ({ setLoading }) => {

  const [listTypeAccount, setlistTypeAcount] = useState([]);
  const [listTypeSpent, setlistTypeSpent] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const listCurrency = [{ id: "1", name: "Lempiras" },
  { id: "2", name: "Dolares" }];
  const [sendForm, setSendForm] = useState(false);

  const ledgerAccountsValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"],
    accountTypeId: [(val) => validInt(val) !== 0, "msg.required.select.typeAccount"],
    expenseTypeId: [(val) => validInt(val) !== 0, "msg.required.select.typeSpent"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    code: '',
    name: '',
    accountType: 0,
    expenseType: 0,
    accountTypeId: 0,
    expenseTypeId: 0,
    currencyId: 0,
    opera: false,
    detailAux: false,
    postIn: false,
    lastDate: '',
    cmonext: false,
    status: true
  }, ledgerAccountsValid);

  const { code, name, accountTypeId, expenseTypeId, currencyId, opera, detailAux, postIn, lastDate, cmonext, status } = formState;

  const fnClearInputs = () => {
    setCurrentItem({});
    onResetForm();
    setSendForm(false);
  }

  const fnEditItem = (item) => {
    item.lastDate = item.lastDate === "1900-01-01" ? "" : item.lastDate
    setCurrentItem(item);
    setBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.ledgerAccounts.table.title"),
    columns: [
      { text: IntlMessages("page.ledgerAccounts.table.ledgerAccount"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.ledgerAccounts.table.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("page.ledgerAccounts.table.posteable"), dataField: "opera", headerStyle: { 'width': '15%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell', type: 'boolean'
      },
      {
        text: IntlMessages("page.ledgerAccounts.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '15%' },
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

  const fnGetData = () => {
    setLoading(true);
    request.GET('accounting/settings/accountants', (resp) => {
      const data
        = resp.data.map((item) => {
          item.level = item.nivel
          return item;
        });
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`accounting/settings/accountants/${currentItem.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const code1 = code.replace(/[.]/g, '');
    const codeLenght = code1.trim().length;
    let level = 0;
    switch (codeLenght) {
      case 1:
        level = 1;
        break;
      case 2:
        level = 2;
        break;
      case 3:
        level = 3;
        break;
      case 4:
        level = 4;
        break;
      case 5:
        level = 4;
        break;
      case 6:
        level = 5;
        break;
      case 7:
        level = 5;
        break;
      case 8:
        level = 6;
        break;
      case 9:
        level = 6;
        break;
      default:
        level = 0;
    }

    const data = {
      code,
      name,
      accountTypeId,
      expenseTypeId,
      currencyId,
      opera,
      nivel: level,
      detailAux,
      postIn,
      lastDate: lastDate === "" ? "1900-01-01" : lastDate,
      cmonext,
      status
    }
    if (currentItem && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`accounting/settings/accountants/${currentItem.id}`, data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('accounting/settings/accountants', data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountTypes', (resp) => {
      const accountTypes = resp.data.map((item) => {
        return {
          id: item.id,
          name: item.name
        }
      });
      setlistTypeAcount(accountTypes)
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('accounting/settings/accountExpenseTypes', (resp) => {
      const spentTypes = resp.data.map((item) => {
        return {
          id: item.id,
          name: item.name
        }
      });
      setlistTypeSpent(spentTypes)
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    fnGetData();

  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return {
    listTypeAccount,
    listTypeSpent,
    listCurrency,
    formState,
    formValidation,
    onInputChange,
    sendForm,
    fnClearInputs,
    fnSave,
    table,
    propsToMsgDelete
  }
}
