import { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import notification from '@/containers/ui/Notifications';

export const useNewEvent = ({ IntlMessages, idPatientFile, setLoading, fnGetEvents, setOpen, currentItem, listPatients, codeFile }) => {
  const [sendForm, setSendForm] = useState(false);
  const [idEvent, setIdEvent] = useState(currentItem?.id || 0);
  const [codeFilePhysic, setCodeFilePhysic] = useState(codeFile);

  const validation = {
    date: [(val) => val !== "", IntlMessages("msg.required.input.date")],
    specialistId1: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.specialistId")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    fatherId: currentItem?.fatherId || idPatientFile,
    typeId: 1,
    date: currentItem?.date || '',
    areaId: currentItem?.hospArea?.id || 0,
    specialistId1: currentItem?.specialist1?.id || 0,
    responsibleName: currentItem?.responsibleName || '',
    responsiblePhone: currentItem?.responsiblePhone || '',
    notes: currentItem?.notes || '',
    status: 1
  }, validation);

  const { fatherId } = formState;

  const onPatientChange = e => {
    const patientId = e.target.value;

    onBulkForm({ fatherId: patientId });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (fatherId === 0) {
      notification('error', 'msg.required.select.patient', 'alert.error.title')
    }

    setLoading(true);
    if (validInt(idEvent) === 0) {
      request.POST('hospital/process/events', formState, (resp) => {
        setLoading(false);
        setIdEvent(resp.data.id);
        fnGetEvents(idPatientFile);
      }, (err) => {
        setLoading(false);
      });
    } else {
      request.PUT(`hospital/process/events/${idEvent}`, formState, (resp) => {
        setLoading(false);
        fnGetEvents(idPatientFile);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnPrintDocument = () => {
    if (idEvent === 0) {
      return
    }
    const dataPrint = {
      idPatientFile: fatherId,
      idEvent
    }
    request.GETPdf('hospital/process/expedients/exportPDFFileEvent', dataPrint, 'Registro de Atencion.pdf', (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    if (fatherId === 0) {
      return;
    }

    const filter = listPatients.find(item => item.value === fatherId);
    setCodeFilePhysic(filter?.code || codeFile);
  }, [fatherId]);

  return (
    {
      idEvent,
      codeFilePhysic,
      formState,
      onInputChange,
      formValidation,
      sendForm,
      fnSaveDocument,
      fnPrintDocument,
      onPatientChange
    }
  )
}
