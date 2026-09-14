import { useEffect, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';

export const useMeasurementUnits = ({ setLoading }) => {

  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  // "Uso en Liquidación de Contenedores" (Checkbox_hw1) solo se muestra si la empresa
  // tiene el control de contenedores activo (mw_setting.cont_control), igual que en
  // el legacy (Checkbox_hw1.Init: This.Visible = IIF(nIs_ContControl == 1, .T., .F.)).
  const [containerControl, setContainerControl] = useState(false);

  const measurementUnitsValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    code: '',
    name: '',
    description: '',
    type: false,
    quantity: 0,
    containerUse: false,
    status: true
  }, measurementUnitsValid);

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.measurementUnits.table.title"),
    columns: [
      { text: IntlMessages("page.measurementUnits.table.code"), dataField: "code", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("page.measurementUnits.table.name"), dataField: "name", headerStyle: { 'width': '30%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      {
        text: IntlMessages("page.measurementUnits.table.type"), dataField: "isPack", headerStyle: { 'width': '15%' },
        classes: 'd-xxs-none-table-cell', headerClasses: 'd-xxs-none-table-cell', type: 'boolean'
      },
      { text: IntlMessages("page.measurementUnits.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '15%' } },
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
    request.GET('inventory/settings/measurementUnits', (resp) => {
      const data = resp.data.map((item) => {
        item.isPack = validInt(item.type) === 2 ? true : false
        return item;
      });
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
    onResetForm();
    setCurrentItem({});
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/measurementUnits/${currentItem.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/measurementUnits', formState, () => {
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
      request.PUT(`inventory/settings/measurementUnits/${currentItem.id}`, data, (resp) => {
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

    const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setContainerControl(!!settings?.containerControl);
      }, () => { });
    }
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      formValidation,
      containerControl,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
