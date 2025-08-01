import { useEffect, useState } from 'react';
import { IntlMessages, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'

export const useAdminCars = ({ setLoading, fnGetDataCars, dataCars }) => {
  const [sendForm, setSendForm] = useState(false);
  const [openMsgDeleteCar, setOpenMsgDeleteCar] = useState(false);

  const validCars = {
    name: [(val) => val !== "", "msg.required.input.name"],
    code: [(val) => val !== "", "msg.required.input.plate"],
    internalCode: [(val) => val !== "", "msg.required.input.code"],
    typeGas: [(val) => validInt(val) > 0, "msg.required.select.fuelType"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    name: '',
    code: '',
    internalCode: '',
    typeGas: 0,
    status: true
  }, validCars);

  const { id, name, code, internalCode, typeGas, status } = formState;

  const fnEditCar = (item) => {
    onBulkForm(item);
  }

  const fnDeleteCar = (item) => {
    onBulkForm({ id: item.id });
    setOpenMsgDeleteCar(true);
  }

  const fnOkDeleteCar = () => {
    setOpenMsgDeleteCar(false);
    setLoading(true);
    request.DELETE(`inventory/process/gasMachines/${id}`, () => {
      fnGetDataCars();
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.fuelPurchases.modal.adminCars.title"),
    columns: [
      {
        text: IntlMessages("table.column.code"),
        dataField: "internalCode",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.name"),
        dataField: "name",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("table.column.plate"),
        dataField: "code",
        headerStyle: { width: "20%" }
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
        onClick: fnEditCar
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteCar
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
      internalCode,
      typeGas,
      status
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`inventory/process/gasMachines/${id}`, newData, () => {
        fnClearInputs();
        fnGetDataCars();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/process/gasMachines', newData, () => {
        fnClearInputs();
        fnGetDataCars();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    const tableData = {
      ...table, data: dataCars
    }
    setTable(tableData);
  }, [dataCars]);

  return (
    {
      formState,
      table,
      onInputChange,
      fnClearInputs,
      fnSave,
      sendForm,
      formValidation,
      openMsgDeleteCar,
      setOpenMsgDeleteCar,
      fnOkDeleteCar,
      onResetForm
    }
  )
}
