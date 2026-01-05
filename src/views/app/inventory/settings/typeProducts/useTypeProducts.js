import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@Helpers/core';

export const useTypeProducts = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const typeProductsValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    codeInit: [(val) => val !== "" || val.length > 3, "msg.required.input.codeInit"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    codeInit: '',
    codeSeq: '00000',
    status: true
  }, typeProductsValid);

  const fnEditItem = (item) => {
    request.moveScrollTop();
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.typeProducts.table.title"),
    columns: [
      { text: IntlMessages("page.typeProducts.table.name"), dataField: "name", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("page.typeProducts.table.codeInit"), dataField: "codeInit", headerStyle: { 'width': '15%' } },
      {
        text: IntlMessages("page.typeProducts.table.codeSeq"), dataField: "codeSeq", headerStyle: { 'width': '15%' },
        classes: 'd-xxs-none-table-cell', headerClasses: 'd-xxs-none-table-cell', style: { textAlign: 'right' }
      },
      { text: IntlMessages("page.typeProducts.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } }
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
    }],
    defaultPageSize: 5
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('inventory/settings/productsClassifications', (resp) => {
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

  const fnClearInputs = () => {
    setCurrentItem({});
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (currentItem && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/productsClassifications/${currentItem.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/productsClassifications', formState, () => {
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
      request.PUT(`inventory/settings/productsClassifications/${currentItem.id}`, data, (resp) => {
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
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      formValidation,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
