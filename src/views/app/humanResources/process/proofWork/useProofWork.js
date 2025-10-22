import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications';

export const useProofWork = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listEmployees, setListEmployees] = useState([]);
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [dataProofWork, setDataProofWork] = useState([]);
  const [openModalViewProofWork, setOpenModalViewProofWork] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const proofWorkValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    creationDate: [(val) => val !== "", "msg.required.input.date"],
    authorizedSignature: [(val) => validInt(val) > 0, "msg.required.select.authorizedSignature"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    typeId: 0,
    creationDate: '',
    contractEndDate: '',
    addressee: '',
    authorizedSignature: 0,
    antiquity: 0,
    salary: 0,
    deductions: 0,
    amount: 0,
    description: '',
    status: 1
  }, proofWorkValid);

  const { id, contractEndDate } = formState;

  const fnNewProofWork = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnSearchProofWork = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET('rrhh/process/proofWork', (resp) => {
      const proofWork = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName} ${item.rrhhEmployee.secondName} ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.dni = item.rrhhEmployee ? `${item.rrhhEmployee.dni}` : ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataProofWork(proofWork);
      setOpenModalViewProofWork(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveProofWork = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      ...formState,
      contractEndDate: contractEndDate === "" ? "1900-01-01" : contractEndDate,
      filePath
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/proofWork', newData, (resp) => {
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
      request.PUT(`rrhh/process/proofWork/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintProofWork = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/proofWork/exportPDFProofWork', dataPrint, 'Constancia de Trabajo.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteProofWork = () => {
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
    request.DELETE(`rrhh/process/proofWork/${id}`, (resp) => {
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
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
          areaManager: item.areaManager
        }
      });
      const filterManagers = employees.filter((item) => {
        return item.areaManager === 1
      });
      setListEmployees(employees);
      setListImmediateBoss(filterManagers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewProofWork,
    fnSearch: fnSearchProofWork,
    fnSave: fnSaveProofWork,
    fnPrint: fnPrintProofWork,
    fnDelete: fnDeleteProofWork,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailProofWork = {
    ...formState,
    filePath,
    setFilePath,
    listEmployees,
    listImmediateBoss,
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
      dataProofWork,
      openModalViewProofWork,
      setBulkForm,
      setFilePath,
      setOpenModalViewProofWork,
      propsToControlPanel,
      propsToDetailProofWork,
      propsToMsgDelete
    }
  )
}
