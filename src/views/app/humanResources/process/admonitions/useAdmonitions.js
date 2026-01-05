import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validInt } from '@Helpers/Utils'
import notification from '@Containers/ui/Notifications'

export const useAdmonitions = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listEmployees, setListEmployees] = useState([]);
  const [listManagers, setListManagers] = useState([]);
  const [listOffenses, setListOffenses] = useState([]);
  const [filterFaults, setFilterFaults] = useState([]);
  const [dataAdmonitions, setDataAdmonitions] = useState([]);
  const [openModalAdmonition, setOpenModalAdmonition] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDismissal, setOpenMsgDismissal] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [showDocto1, setShowDocto1] = useState("none");
  const [showDocto2, setShowDocto2] = useState("none");
  const [showDocto3, setShowDocto3] = useState("none");
  const [showOffense, setShowOffense] = useState("none");
  const [showReportM, setShowReportM] = useState("none");
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const admonitionsValid = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"],
    documentTypeId: [(val) => validInt(val) > 0, "msg.required.select.type"],
    offenseDate: [(val) => val !== "", "msg.required.input.date"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentTypeId: 0,
    employeeId: 0,
    offenseDate: '',
    offenseTypeId: 0,
    admonitionTypeId: 0,
    description: '',
    notes: '',
    reportManagerId: 0,
    offenseId: 0,
    appointmentDate: '',
    witnessId: 0,
    abandonmentDate1: '',
    abandonmentDate2: '',
    abandonmentDate3: '',
    status: 1
  }, admonitionsValid);

  const { id, documentTypeId, employeeId, offenseTypeId, admonitionTypeId, description, reportManagerId, offenseId, appointmentDate, witnessId, abandonmentDate1, abandonmentDate2, abandonmentDate3 } = formState;

  const fnNewAdmonition = () => {
    onResetForm();
    setSendForm(false);
    setFilePath("");
  }

  const fnSearchAdmonition = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET('rrhh/process/admonitions', (resp) => {
      const admonitions = resp.data.map((item) => {
        item.employee = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName}
        ${item.rrhhEmployee.secondLastName}` : ""
        item.type = item.rrhhAdmonitionDocumentType ? item.rrhhAdmonitionDocumentType.name : ""
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataAdmonitions(admonitions);
      setOpenModalAdmonition(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveAdmonition = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(documentTypeId) === 1) {
      if (validInt(offenseTypeId) === 0) {
        notification('warning', 'msg.required.select.offenseTypeId', 'alert.warning.title');
        return;
      }
      if (validInt(admonitionTypeId) === 0) {
        notification('warning', 'msg.required.select.admonitionTypeId', 'alert.warning.title');
        return;
      }
      if (description === "") {
        notification('warning', 'msg.required.input.description', 'alert.warning.title');
        return;
      }
    } else if (validInt(documentTypeId) === 2) {
      if (validInt(reportManagerId) === 0) {
        notification('warning', 'msg.required.select.reportManagerId', 'alert.warning.title');
        return;
      }
      if (validInt(offenseTypeId) === 0) {
        notification('warning', 'msg.required.select.offenseTypeId', 'alert.warning.title');
        return;
      }
      if (validInt(offenseId) === 0) {
        notification('warning', 'msg.required.select.offenseId', 'alert.warning.title');
        return;
      }
      if (appointmentDate === "") {
        notification('warning', 'msg.required.select.appointmentDate', 'alert.warning.title');
        return;
      }
    } else if (validInt(documentTypeId) === 3) {
      if (validInt(reportManagerId) === 0) {
        notification('warning', 'msg.required.select.reportManagerId', 'alert.warning.title');
        return;
      }
      if (validInt(witnessId) === 0) {
        notification('warning', 'msg.required.select.witnessId', 'alert.warning.title');
        return;
      }
      if (appointmentDate === "") {
        notification('warning', 'msg.required.select.appointmentDate', 'alert.warning.title');
        return;
      }
      if (abandonmentDate1 === "" || abandonmentDate2 === "") {
        notification('warning', 'msg.required.select.abandonmentDates', 'alert.warning.title');
        return;
      }
    } else if (validInt(documentTypeId) === 4 && id === 0) {
      setOpenMsgDismissal(true);
      return;
    }

    const newData = {
      ...formState,
      appointmentDate: appointmentDate === "" ? "1900-01-01" : appointmentDate,
      abandonmentDate1: abandonmentDate1 === "" ? "1900-01-01" : abandonmentDate1,
      abandonmentDate2: abandonmentDate2 === "" ? "1900-01-01" : abandonmentDate2,
      abandonmentDate3: abandonmentDate3 === "" ? "1900-01-01" : abandonmentDate3,
      filePath
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/admonitions', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        if (validInt(documentTypeId) === 3) {
          // deshabilitar empleado
          const editData = {
            status: 0
          }
          request.PUT(`rrhh/process/employees/${employeeId}`, editData, () => {
            setLoading(false);
          }, (err) => {

            setLoading(false);
          });
        }
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/admonitions/${id}`, newData, () => {
        setSendForm(false);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnGenerateDismiss = () => {
    const newData = {
      ...formState,
      appointmentDate: appointmentDate === "" ? "1900-01-01" : appointmentDate,
      abandonmentDate1: abandonmentDate1 === "" ? "1900-01-01" : abandonmentDate1,
      abandonmentDate2: abandonmentDate2 === "" ? "1900-01-01" : abandonmentDate2,
      abandonmentDate3: abandonmentDate3 === "" ? "1900-01-01" : abandonmentDate3,
      filePath
    }

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/admonitions', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setLoading(true);
        // deshabilitar empleado
        const editData = {
          status: 0
        }
        request.PUT(`rrhh/process/employees/${employeeId}`, editData, () => {
          setOpenMsgDismissal(false);
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnPrintAdmonition = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      if (validInt(documentTypeId) === 1) {
        request.GETPdf('rrhh/process/admonitions/exportPDFAdmonition', dataPrint, 'Amonestación.pdf', (err) => {

          setLoading(false);
        });
      } else if (validInt(documentTypeId) === 2) {
        request.GETPdf('rrhh/process/admonitions/exportPDFCitation', dataPrint, 'Citación.pdf', (err) => {

          setLoading(false);
        });
      } else if (validInt(documentTypeId) === 3) {
        request.GETPdf('rrhh/process/admonitions/exportPDFAbandonment', dataPrint, 'Acta de Abandono de Labores.pdf', (err) => {

          setLoading(false);
        });
      }
      else if (validInt(documentTypeId) === 4) {
        request.GETPdf('rrhh/process/admonitions/exportPDFProbationaryDismissal', dataPrint, 'Despido en Periodo de Prueba.pdf', (err) => {

          setLoading(false);
        });
      }
    }
  }

  const fnCancelAdmonition = () => {
    if (fnDelete === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnCancel = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    const editData = {
      status: 0
    }
    request.PUT(`rrhh/process/admonitions/${id}`, editData, () => {
      onResetForm();
      setLoading(false);
    }, (err) => {

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
      setListManagers(filterManagers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('rrhh/settings/faulTypes', (resp) => {
      const faulTypes = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
          faulClassificationId: item.faulClassificationId
        }
      });
      setListOffenses(faulTypes);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewAdmonition,
    fnSearch: fnSearchAdmonition,
    fnSave: fnSaveAdmonition,
    fnPrint: fnPrintAdmonition,
    fnCancel: fnCancelAdmonition,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToDetailAdmonition = {
    ...formState,
    filePath,
    setFilePath,
    listEmployees,
    listManagers,
    listOffenses,
    filterFaults,
    setFilterFaults,
    onInputChange,
    setBulkForm,
    showDocto1,
    setShowDocto1,
    showDocto2,
    setShowDocto2,
    showDocto3,
    setShowDocto3,
    showOffense,
    setShowOffense,
    showReportM,
    setShowReportM,
    formValidation,
    sendForm
  }

  const propsToMsgCancel = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnCancel,
    title: "msg.question.cancel.document.title"
  }

  const propsToMsgDismissal = {
    open: openMsgDismissal,
    setOpen: setOpenMsgDismissal,
    fnOnOk: fnGenerateDismiss,
    title: "alert.question.probationaryDismissal"
  }

  return (
    {
      dataAdmonitions,
      listOffenses,
      openModalAdmonition,
      setOpenModalAdmonition,
      setBulkForm,
      setFilePath,
      setShowDocto1,
      setShowDocto2,
      setShowDocto3,
      setShowOffense,
      setShowReportM,
      setFilterFaults,
      propsToControlPanel,
      propsToDetailAdmonition,
      propsToMsgCancel,
      propsToMsgDismissal
    }
  )
}
