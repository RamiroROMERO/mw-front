import { IntlMessages } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useAdminDrivers = ({ setLoading, fnGetDataDrivers, dataDrivers }) => {
  const [sendForm, setSendForm] = useState(false);
  const [openMsgDeleteDriver, setOpenMsgDeleteDriver] = useState(false);

  const validDrivers = {
    name: [(val) => val !== "", "msg.required.input.name"],
    code: [(val) => val !== "", "msg.required.input.code"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    name: '',
    code: '',
    status: true
  }, validDrivers);

  const { id, name, code, status } = formState;

  const fnEditDriver = (item) => {
    onBulkForm(item);
  }

  const fnDeleteDriver = (item) => {
    onBulkForm({ id: item.id });
    setOpenMsgDeleteDriver(true);
  }

  const fnOkDeleteDriver = () => {
    setOpenMsgDeleteDriver(false);
    setLoading(true);
    request.DELETE(`inventory/process/gasDrivers/${id}`, () => {
      fnGetDataDrivers();
      onResetForm();
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.fuelPurchases.modal.adminDrivers.title"),
    columns: [
      {
        text: IntlMessages("table.column.code"),
        dataField: "code",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: { width: "65%" }
      },
      {
        text: IntlMessages("table.column.status"),
        dataField: "statusIcon",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.options"),
        dataField: "options",
        headerStyle: { 'width': '10%' }
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
        onClick: fnEditDriver
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteDriver
      }
    ]
  });

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      name,
      code,
      status
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`inventory/process/gasDrivers/${id}`, newData, () => {
        fnClearInputs();
        fnGetDataDrivers();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/process/gasDrivers', newData, () => {
        fnClearInputs();
        fnGetDataDrivers();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    const tableData = {
      ...table, data: dataDrivers
    }
    setTable(tableData);
  }, [dataDrivers])

  return (
    {
      formState,
      onInputChange,
      table,
      fnClearInputs,
      fnSave,
      formValidation,
      sendForm,
      openMsgDeleteDriver,
      setOpenMsgDeleteDriver,
      fnOkDeleteDriver,
      onResetForm
    }
  )
}
