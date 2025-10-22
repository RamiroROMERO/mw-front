import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { useState } from 'react'
import notification from '@Containers/ui/Notifications';

export const useHeader = ({setLoading, table, setTable, enableGenerateReport}) => {
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validation = {
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    projectId: 0
  }, validation);

  const {projectId} = formState;

  const fnExportDocument = ()=>{
    const dataPrint = {
      projectId,
      userName: userData.name
    }
    request.GETPdf('rrhh/process/projectDetail/exportPDFProjectTransfers', dataPrint, 'Reporte de Traslado de Proyectos.pdf', (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetData = ()=>{
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newActions = {
      color: "primary",
      icon: "file-earmark-pdf",
      onClick: fnExportDocument,
      title: "Exportar",
      isFreeAction: true
    }

    setLoading(true);
    request.GET(`rrhh/process/projectDetail/findProjectTransfers?projectId=${projectId}`, (resp) => {
      const projectDeta = resp.data.map((item) => {
        item.workShifts = item.rrhhSchedule?.name || ''
        item.employee = `${item.rrhhEmployee?.firstName || ''} ${item.rrhhEmployee?.secondName || ''} ${item.rrhhEmployee?.lastName || ''} ${item.rrhhEmployee?.secondLastName || ''}`
        item.prevProject = item.rrhhProject?.name || ''
        return item;
      });
      setTable({ ...table, data: projectDeta, actions: [newActions] });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      onInputChange,
      fnGetData
    }
  )
}
