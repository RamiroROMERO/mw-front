import React, { useEffect, useState } from 'react'
import { Badge } from 'reactstrap';
import { useForm } from '@/hooks';
import { IntlMessages, IntlMessagesFn, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useAreas = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const validation = {
    companyId: [(val) => validInt(val) !== 0, IntlMessagesFn("page.validation.companyId")],
    name: [(val) => val.length > 5, IntlMessagesFn("page.validation.name")],
    accDepreciation: [(val) => val.length > 8, IntlMessagesFn("page.validation.accountant")],
    accCost: [(val) => val.length > 8, IntlMessagesFn("page.validation.accountant")],
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    companyId: 0,
    name: '',
    accDepreciation: '',
    accCost: '',
    status: 0
  }, validation);

  const { id } = formState;

  const fnChangeCompanyId = ({ target }) => {
    const { value } = target;
    if (validInt(value) === 0) {
      setAccountList([]);
    }
    request.getJSON("accounting/settings/accountants/getSL", { companyId: value }, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.cta;
        item.label = `${item.cta}-${item.nombre}`;
        return item;
      });
      setAccountList(list);
    });
    onInputChange({ target });
  }

  const fnEditDocument = (row) => {
    request.getJSON("accounting/settings/accountants/getSL", { companyId: row.companyId }, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.cta;
        item.label = `${item.cta}-${item.nombre}`;
        return item;
      });
      setAccountList(list);
      onBulkForm(row);
    });
  }
  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('fixedAssets/settings/areas', formState, () => {
        setLoading(false);
        fnGetTableData();
        onResetForm();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`fixedAssets/settings/areas/${id}`, formState, () => {
        setLoading(false);
        fnGetTableData();
        onResetForm();
      }, (err) => {
        console.log(err);
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
    request.DELETE(`fixedAssets/settings/areas/${id}`, () => {
      setLoading(false);
      onResetForm();
      fnGetTableData();
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetData = () => {
    request.getJSON("admin/companies/getSL", {}, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.id;
        item.label = item.name;
        return item;
      });
      setCompanyList(list);
    });
  }

  const fnGetTableData = () => {
    setLoading(true);
    request.GET('fixedAssets/settings/areas', (resp) => {
      const { data } = resp;
      const listData = data.map(elem => {
        elem.statusIcon = validInt(elem.status) === 1 ? <Badge className="text-white" color="success"> {IntlMessages("label.active")}</Badge> : <Badge className="text-white" color="danger"> {IntlMessages("label.inactive")}</Badge>
        return elem;
      });
      setTableData(listData);
      setTable({ ...table, data: listData });
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.fixedAssets.areas"),
    columns: [
      { text: IntlMessages("input.name"), dataField: "name", headerStyle: { 'width': '50%' } },
      { text: IntlMessages("check.status"), dataField: "statusIcon", headerStyle: { 'width': '30%' } },
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
    onInputChange,
    onResetForm,
    onBulkForm,
    formValidation,
    isFormValid,
    fnSaveDocument,
    fnChangeCompanyId,
    table,
    sendForm,
    propsToMsgDelete,
    lists: { accountList, companyList }
  }
}
