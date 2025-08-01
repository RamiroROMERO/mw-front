import React, { useState, useEffect } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'

export const useModalBeneficiaries = ({ employeeId, setLoading }) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validations = {
    name: [(val) => val !== "", "msg.required.input.name"],
    dni: [(val) => val !== "", "msg.required.input.dni"],
    parentId: [(val) => validInt(val) > 0, "msg.required.select.relationship"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    employeeId: employeeId,
    name: '',
    dni: '',
    phone: '',
    address: '',
    parentId: 0,
    status: 1
  }, validations);

  const { id, name, dni, phone, address, parentId, status } = formState;

  const fnEditDependents = (item) => {
    onBulkForm(item);
  }

  const fnDeleteDependent = (item) => {
    onBulkForm({ id: item.id });
    setOpenMsgQuestion(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.employees.modal.dependents.title"),
    columns: [
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("table.column.dni"),
        dataField: "dni",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("page.employees.modal.dependents.select.relationship"),
        dataField: "parentName",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: { width: "10%" }
      }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditDependents
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDependent,
      }
    ]
  });

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET(`rrhh/process/employeeBeneficiaries?employeeId=${employeeId}`, (resp) => {
      const beneficiaries = resp.data.map((item) => {
        item.parentName = item.rrhhParent ? item.rrhhParent.name : ''
        item.statusIcon = (item.status === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      const tableData = {
        ...table, data: beneficiaries
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

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/employeeBeneficiaries', formState, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/employeeBeneficiaries/${id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/employeeBeneficiaries/${id}`, (resp) => {
      fnGetData();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDelete,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      formState,
      formValidation,
      onInputChange,
      table,
      sendForm,
      fnSave,
      fnClearInputs,
      propsToMsgDelete
    }
  )
}
