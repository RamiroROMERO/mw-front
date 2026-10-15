import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@Helpers/Utils";
import { request } from '@Helpers/core';
import { validateUnit, buildUnitPayload } from './measurementUnitRules';

export const useMeasurementUnits = ({ setLoading }) => {

  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  // "Uso en Liquidación de Contenedores" (Checkbox_hw1) solo se muestra si la empresa
  // tiene el control de contenedores activo (mw_setting.cont_control), igual que en
  // el legacy (Checkbox_hw1.Init: This.Visible = IIF(nIs_ContControl == 1, .T., .F.)).
  const [containerControl, setContainerControl] = useState(false);

  // `isPackaging` es "Presentación de Empaque" (booleano; el back lo guarda como tipo 1 o 2) y `baseConversion` la
  // "Conversión en base 1" (columna `cant`).
  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    code: '',
    name: '',
    description: '',
    isPackaging: false,
    baseConversion: 0,
    containerUse: false,
    status: true
  });

  // Mismas reglas que el back (measurementUnitRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateUnit(formState), [formState]);

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
        text: IntlMessages("page.measurementUnits.table.type"), dataField: "isPackaging", headerStyle: { 'width': '15%' },
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
      const tableData = {
        ...table, data: resp.data
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
    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = buildUnitPayload(formState, { containerControl });

    if (currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/measurementUnits/${currentItem.id}`, payload, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/measurementUnits', payload, () => {
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
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      // Eliminar (elimina = 1) solo si la unidad no está en uso por productos, documentos o conversiones; el back lo rechaza
      // con measurementUnit.inUse. La casilla "Activo" (status) es independiente.
      request.DELETE(`inventory/settings/measurementUnits/${currentItem.id}`, (resp) => {
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
      errors,
      containerControl,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
