import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@Helpers/core';

export const useStore = ({ setLoading }) => {

  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [dataTable, setDataTable] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const listType = [{ id: 1, name: "Almacen" }, { id: 2, name: "Centro de Destino" }, { id: 3, name: "Ambos" }]

  const storeValid = {
    name: [(val) => val !== "", "msg.required.input.name"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    type: 1,
    status: true,
    idCtaInventory: '',
    idCtaCost: '',
    idCtaExpense: ''
  }, storeValid);

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.store.table.title"),
    columns: [
      { text: IntlMessages("page.store.table.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.store.table.type"), dataField: "typeName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.store.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } },
    ],
    options: {
      showViewColumns: true
    },
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
    setCurrentItem({});
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('inventory/settings/stores', (resp) => {
      const data = resp.data.map((item) => {
        item.typeName = item.type === 1 ? "Almacen" : item.type === 2 ? "Centro de Destino" : "Ambos"
        return item;
      });
      setDataTable(data)
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

    if (currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/stores/${currentItem.id}`, formState, (resp) => {
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
      request.POST('inventory/settings/stores', formState, (resp) => {
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
    setLoading(true);
    const data = {
      status: 0
    }
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/stores/${currentItem.id}`, data, (resp) => {
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
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListLedgerAccounts([...listAccounts]);
      setLoading(false);
      fnGetData();
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      listType,
      listLedgerAccounts,
      table,
      dataTable,
      propsToMsgDelete,
      formState,
      formValidation,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
