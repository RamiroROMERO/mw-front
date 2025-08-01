import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { formatDate, validInt } from '@Helpers/Utils'

export const useBiweeklys = ({setLoading}) => {
  const [dataBiweeklies, setDataBiweeklies] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const biweekliesValid = {
    noBiweekly: [(val) => validInt(val) > 0, "msg.required.select.noBiweekly"],
    noYear: [(val) => validInt(val) > 0 && val.length === 4, "msg.required.input.noYear"],
    dateIn: [(val) => val !== "", "msg.required.select.dateStart"],
    dateOut: [(val) => val !== "", "msg.required.select.dateEnd"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    noYear: 0,
    dateIn: '',
    dateOut: '',
    noBiweekly: 0,
    status: 1
  }, biweekliesValid);

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/process/byweeklies', (resp) => {
      const biweeklies = resp.data.map((item) => {
        item.dateStart = formatDate(item.dateIn)
        item.dateEnd = formatDate(item.dateOut)
        item.biweekly = item.noBiweekly === 1 ? "Primera" : "Segunda"
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataBiweeklies(biweeklies);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

   const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
  }

  const fnSave = ()=>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if(formState.id === 0){
      setLoading(true);
      request.POST('rrhh/process/byweeklies', formState, (resp) => {
        onInputChange({target:{name:'id', value:resp.data.id}});
        fnGetData();
        fnClearInputs();
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/byweeklies/${formState.id}`, formState, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`rrhh/settings/overtimes/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToDetailBiweekly = {
    ...formState,
    onInputChange,
    formValidation,
    sendForm,
    fnSave,
    fnClearInputs
  }

  const propsToDetailTable = {
    dataBiweeklies,
    setBulkForm,
    setOpenMsgQuestion
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    title: "alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      propsToDetailBiweekly,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
