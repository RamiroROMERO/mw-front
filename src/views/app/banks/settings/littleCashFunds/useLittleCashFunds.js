import { useEffect, useState } from 'react';
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';

export const useLittleCashFunds = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [listAccount, setListAccount] = useState([]);

  const littleCashFundValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    code: [(val) => val !== "", "msg.required.input.code"],
    numberAccount: [(val) => val !== "", "msg.required.select.ctaCount"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    code: '',
    codeInt: 1,
    valuePayment: 0,
    numberAccount: '',
    status: true
  }, littleCashFundValid);

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.littleCashFunds.table.title"),
    columns: [
      { text: IntlMessages("page.littleCashFunds.table.code"), dataField: "code", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.littleCashFunds.table.name"), dataField: "name", headerStyle: { width: '35%' } },
      { text: IntlMessages("page.littleCashFunds.table.numberAccount"), dataField: "numberAccount", headerStyle: { width: '20%' } },
      { text: IntlMessages("page.littleCashFunds.table.valuePayment"), dataField: "valuePayment", type: 'number', headerStyle: { width: '15%' } },
      { text: IntlMessages("page.littleCashFunds.table.status"), dataField: "status", type: 'boolean', headerStyle: { width: '10%' } }
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

  const fnGetData = () => {
    setLoading(true);
    request.GET('banks/settings/littleCashFunds', (resp) => {
      setTable((prev) => ({ ...prev, data: resp.data }));
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnClearInputs = () => {
    onResetForm();
    setCurrentItem({});
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) return;

    setLoading(true);
    if (currentItem.id > 0) {
      request.PUT(`banks/settings/littleCashFunds/${currentItem.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/settings/littleCashFunds', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id > 0) {
      setLoading(true);
      request.PUT(`banks/settings/littleCashFunds/${currentItem.id}`, { status: false }, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  useEffect(() => {
    fnGetData();
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title" }

  return {
    sendForm,
    table,
    propsToMsgDelete,
    formState,
    formValidation,
    listAccount,
    fnClearInputs,
    fnSave,
    onInputChange
  }
}
