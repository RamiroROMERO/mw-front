import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { validInt } from '@Helpers/Utils'
import { request } from '@Helpers/core'
import notification from '@Containers/ui/Notifications';

export const useIncapacities = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listEmployees, setListEmployees] = useState([]);
  const [dataIncapacities, setDataIncapacities] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalIncapacity, setOpenModalIncapacity] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const incapacitiesValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    reason: [(val) => val !== "", "msg.required.input.reason"],
    description: [(val) => val !== "", "msg.required.input.description"],
    startDisability: [(val) => val !== "", "msg.required.select.startDisability"],
    endDisability: [(val) => val !== "", "msg.required.select.endDisability"],
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    employeeId: 0,
    reason: '',
    description: '',
    employeeStatus: '',
    medicalAsistance: '',
    startDisability: '',
    endDisability: '',
    comments: ''
  }, incapacitiesValid);

  const { id, date, employeeId, reason, description, employeeStatus, medicalAsistance, startDisability, endDisability, comments } = formState;

  const fnNewIncapacity = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchIncapacity = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET('rrhh/process/incapacities', (resp) => {
      const incapacities = resp.data.map((item) => {
        item.startDisability = item.startDisability==="0000-00-00"?"1900-01-01":item.startDisability
        item.endDisability = item.endDisability==="0000-00-00"?"1900-01-01":item.endDisability
        item.employee = `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName} 
        ${item.rrhhEmployee.secondLastName}`
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataIncapacities(incapacities);
      setOpenModalIncapacity(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveIncapacity = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/incapacities', formState, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/incapacities/${id}`, formState, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintIncapacity = () => []

  const fnDeleteIncapacity = () => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnConfirmDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`rrhh/process/incapacities/${id}`, (resp) => {
      console.log(resp);
      onResetForm();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/employees/findSL', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewIncapacity,
    fnSearch: fnSearchIncapacity,
    fnSave: fnSaveIncapacity,
    fnPrint: fnPrintIncapacity,
    fnDelete: fnDeleteIncapacity,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailIncapacity = {
    date,
    employeeId,
    reason,
    description,
    employeeStatus,
    medicalAsistance,
    startDisability,
    endDisability,
    comments,
    listEmployees,
    onInputChange,
    formValidation,
    sendForm
  }

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnConfirmDelete,
    title: "alert.question.title"
  }

  return (
    {
      dataIncapacities,
      setBulkForm,
      openModalIncapacity,
      setOpenModalIncapacity,
      propsToControlPanel,
      propsToDetailIncapacity,
      propsToMsgDelete
    }
  )
}
