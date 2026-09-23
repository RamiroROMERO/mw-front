import { useEffect, useState } from 'react'
import { IntlMessages } from "@Helpers/Utils";
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';

const fiscalPeriodsValid = {
  period: [(val) => val !== "", "msg.required.input.period"],
  dateIn: [(val) => val !== "", "msg.required.input.dateIn"],
  dateOut: [(val) => val !== "", "msg.required.input.dateOut"]
}

export const useFiscalPeriods = ({ setLoading }) => {

  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, setBulkForm, onResetForm } = useForm({
    id: 0,
    period: '',
    dateIn: '',
    dateOut: '',
    active: false,
    status: true
  }, fiscalPeriodsValid);

  const fnEditItem = (item) => {
    setBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.fiscalPeriods.table.title"),
    columns: [
      { text: IntlMessages("page.fiscalPeriods.table.period"), dataField: "period", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.fiscalPeriods.table.dateIn"), dataField: "dateIn", type: 'date', headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.fiscalPeriods.table.dateOut"), dataField: "dateOut", type: 'date', headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.fiscalPeriods.table.active"), dataField: "active", type: 'boolean', headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.fiscalPeriods.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '15%' } }
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
    request.GET('tax/settings/fiscalPeriods', (resp) => {
      const data = [...resp.data].sort((a, b) => b.dateIn.localeCompare(a.dateIn));
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

    const data = {
      ...formState
    }

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`tax/settings/fiscalPeriods/${formState.id}`, data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('tax/settings/fiscalPeriods', data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  };

  const fnDisableItem = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`tax/settings/fiscalPeriods/${currentItem.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableItem, title: "alert.question.title", setCurrentItem }

  useEffect(() => {
    fnGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    formState,
    onInputChange,
    formValidation,
    fnClearInputs,
    fnSave,
    table,
    propsToMsgDelete,
    sendForm
  }
}
