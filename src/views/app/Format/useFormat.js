import React, { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { IntlMessages, IntlMessagesFn, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useFormat = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const validation = {
    id: [(val) => validInt(val) !== 0, IntlMessagesFn("page.fixedAssets.validation.code")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0
  }, validation);

  const { id } = formState;

  const fnEditDocument = (row) => {
    onBulkForm(row);
  }
  const fnSaveDocument = () => {
    setLoading(true);
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if (validInt(id) === 0) {
      request.POST('', formState, () => {
        setLoading(false);
        fnGetTableData();
        onResetForm();
      }, (err) => {
        setLoading(false);
      })
    } else {
      request.PUT(`/${id}`, formState, () => {
        setLoading(false);
        fnGetTableData();
        onResetForm();
      }, (err) => {
        setLoading(false);
      });
    }
  };

  const fnDeleteDocument = (row) => {
    onBulkForm(row);
    setOpenMsgQuestion(true);
  };

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    if (validInt(id) === 0) {
      return;
    }
    setLoading(true);
    request.DELETE(`/${id}`, () => {
      setLoading(false);
      onResetForm();
      fnGetTableData();
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetData = () => {

    request.getJSON("accounting/settings/accountants/getSL", {}, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.cta;
        item.label = `${item.cta}-${item.nombre}`;
        return item;
      });
      setAccountList(list);
    });
  }

  const fnGetTableData = () => {
    setLoading(true);
    request.GET('fixedAssets/settings/types', (resp) => {
      const { data } = resp;
      setTableData(data);
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.fixedAssets.types"),
    columns: [
      { text: IntlMessages("input.code"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("input.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("check.status"), dataField: "statusIcon", headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '20%' } }
    ],
    data: tableData,
    options: {
      columnActions: 'options'
    },
    actions: [{
      color: 'primary',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: 'danger',
      onClick: fnDeleteDocument,
      icon: 'trash'
    }],
  });


  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    fnOnNo: onResetForm
  };

  useEffect(() => {
    fnGetData();
    fnGetTableData();
  }, [])


  return {
    formState,
    accountList,
    onInputChange,
    onResetForm,
    onBulkForm,
    formValidation,
    isFormValid,
    fnSaveDocument,
    table,
    sendForm,
    propsToMsgDelete
  }
}
