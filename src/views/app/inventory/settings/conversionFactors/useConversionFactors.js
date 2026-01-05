import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages } from "@/helpers/Utils";
import { request } from '@Helpers/core';
import { validFloat } from '@Helpers/Utils';

export const useConversionFactors = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [listMUnits, setMUnits] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const conversionFactorsValid = {
    inputUnit: [(val) => val !== '', "msg.required.select.inputUnit"],
    outputUnit: [(val) => val !== '', "msg.required.select.outputUnit"],
    valueFactor: [(val) => validFloat(val) > 0, "msg.required.input.valueFactor"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    inputUnit: '',
    outputUnit: '',
    valueFactor: 0,
    status: true
  }, conversionFactorsValid);

  const fnEditItem = (item) => {
    setCurrentItem(item);
    setBulkForm(item);
    window.scrollTo(0, 0);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.conversionFactors.table.title"),
    columns: [
      { text: IntlMessages("page.conversionFactors.table.inputUnit"), dataField: "inputUnitName", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("page.conversionFactors.table.outputUnit"), dataField: "outputUnitName", headerStyle: { 'width': '25%' } },
      {
        text: IntlMessages("page.conversionFactors.table.valueFactors"), dataField: "valueFactor", headerStyle: { 'width': '20%' },
        classes: 'd-xxs-none-table-cell', headerClasses: 'd-xxs-none-table-cell', style: { textAlign: 'right' }
      },
      { text: IntlMessages("page.conversionFactors.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } }
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

  const fnClearInputs = () => {
    onResetForm();
    setCurrentItem({});
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('inventory/settings/conversionFactors', (resp) => {
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

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (currentItem.id > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/conversionFactors/${currentItem.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/conversionFactors', formState, () => {
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
      request.PUT(`inventory/settings/conversionFactors/${currentItem.id}`, data, (resp) => {
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

    setLoading(true);
    request.GET('inventory/settings/measurementUnits?elimina=0', (resp) => {
      const listUnits = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.code
        }
      });
      setMUnits(listUnits);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      formValidation,
      listMUnits,
      fnClearInputs,
      fnSave,
      onInputChange
    }
  )
}
