import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications';

export const useVacations = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listImmediateBoss, setListImmediateBoss] = useState([]);
  const [listEmployees, setListEmployees] = useState([]);
  const [dataVacations, setdataVacations] = useState([]);
  const [openModalVacations, setOpenModalVacations] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const vacationsValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateStart: [(val) => val !== "", "msg.required.select.dateStart"],
    dateEnd: [(val) => val !== "", "msg.required.select.dateEnd"],
    authorizedById: [(val) => validInt(val) > 0, "msg.required.select.authorizedBy"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    employeeId: 0,
    date: '',
    dateStart: '',
    dateEnd: '',
    description: '',
    notes: '',
    phoneContact: '',
    authorizedById: '',
    incSunday: 0,
    paidVacation: 0,
    status: 1
  }, vacationsValid);

  const { id } = formState;

  const fnNewVacation = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnSearchVacation = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET('rrhh/process/vacations', (resp) => {
      const vacations = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.authorizedBy = item.rrhhAuthorized ? `${item.rrhhAuthorized.firstName}  ${item.rrhhAuthorized.secondName}  ${item.rrhhAuthorized.lastName}
        ${item.rrhhAuthorized.secondLastName}` : ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setdataVacations(vacations);
      setOpenModalVacations(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveVacation = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      ...formState,
      filePath
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/vacations', newData, (resp) => {
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
      request.PUT(`rrhh/process/vacations/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintVacation = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('rrhh/process/vacations/exportPDFVacation', dataPrint, 'Solicitud de Vacaciones.pdf', (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteVacation = () => {
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
    request.DELETE(`rrhh/process/vacations/${id}`, () => {
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
    fnNew: fnNewVacation,
    fnSearch: fnSearchVacation,
    fnSave: fnSaveVacation,
    fnPrint: fnPrintVacation,
    fnDelete: fnDeleteVacation,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailVacation = {
    ...formState,
    filePath,
    setFilePath,
    listImmediateBoss,
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
      dataVacations,
      setBulkForm,
      openModalVacations,
      setOpenModalVacations,
      setFilePath,
      propsToControlPanel,
      propsToDetailVacation,
      propsToMsgDelete
    }
  )
}
