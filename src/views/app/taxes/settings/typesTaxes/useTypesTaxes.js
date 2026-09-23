import { useEffect, useState } from 'react'
import { IntlMessages } from "@Helpers/Utils";
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';

const typesTaxesValid = {
  name: [(val) => val !== "", "msg.required.input.name"],
  typeGas: [(val) => Number(val) > 0, "msg.required.select"]
}

export const useTypesTaxes = ({ setLoading }) => {

  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, setBulkForm, onResetForm } = useForm({
    id: 0,
    name: '',
    typeGas: 0,
    isFiscal: false,
    fiscalCode: '',
    status: true
  }, typesTaxesValid);

  const fnEditItem = (item) => {
    setBulkForm(item);
  }

  const fnDeleteItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.typesTaxes.table.title"),
    columns: [
      { text: IntlMessages("page.typesTaxes.table.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      {
        text: IntlMessages("page.typesTaxes.table.type"), dataField: "typeGas", headerStyle: { 'width': '25%' },
        cell: ({ row }) => IntlMessages(row.original.typeGas === 1 ? "page.typesTaxes.radio.purchase" : "page.typesTaxes.radio.sale")
      },
      { text: IntlMessages("page.typesTaxes.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '15%' } }
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
    request.GET('admin/taxStatNames', (resp) => {
      const data = [...resp.data].sort((a, b) => a.name.localeCompare(b.name));
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
      ...formState,
      typeGas: Number(formState.typeGas)
    }

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/taxStatNames/${formState.id}`, data, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/taxStatNames', data, () => {
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
      request.PUT(`admin/taxStatNames/${currentItem.id}`, data, () => {
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
