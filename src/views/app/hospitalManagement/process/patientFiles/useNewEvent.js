import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';
import notification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { printEventOptions } from './patientRules';
import { validateEvent, buildEventPayload } from '../events/eventRules';

const today = () => DateHelper.format(DateHelper.now());

// SPEC v2-151-sr: el evento se valida con las mismas reglas del back (fecha no futura, área y médico) y, con aseguradora privada, la aseguradora, los términos y el tipo de asegurado. Al
// back solo viajan los campos del evento (el estado, el tipo y la factura cambian con sus acciones).
export const useNewEvent = ({ IntlMessages, idPatientFile, setLoading, fnGetEvents, setOpen, currentItem, listPatients, codeFile }) => {
  const [sendForm, setSendForm] = useState(false);
  const [idEvent, setIdEvent] = useState(currentItem?.id || 0);
  const [codeFilePhysic, setCodeFilePhysic] = useState(codeFile);
  const [insuranceOptions, setInsuranceOptions] = useState({ insurers: [], terms: [], secureTypes: [] });

  const { formState, onInputChange, onBulkForm } = useForm({
    id: currentItem?.id || 0,
    fatherId: currentItem?.fatherId || idPatientFile,
    date: currentItem?.date ? String(currentItem.date).slice(0, 10) : today(),
    areaId: currentItem?.hospArea?.id || 0,
    attendingSpecialistId: currentItem?.attendingSpecialist?.id || 0,
    responsibleName: currentItem?.responsibleName || '',
    responsiblePhone: currentItem?.responsiblePhone || '',
    notes: currentItem?.notes || '',
    eventType: currentItem?.eventType || 1,
    insuranceId: currentItem?.insuranceId || 0,
    termsId: currentItem?.termsId || 0,
    secureTypeId: currentItem?.secureTypeId || 0,
    coverVal: currentItem?.coverVal || 0,
    contractor: currentItem?.contractor || '',
    poliza: currentItem?.poliza || '',
    certificate: currentItem?.certificate || '',
    valDeduc: currentItem?.valDeduc || 0
  });

  const { fatherId } = formState;

  // Traduce los problemas a los `xxxValid` que ya leen los modales (clave de traducción -> texto).
  const problems = validateEvent(formState, today());
  const formValidation = Object.fromEntries(Object.entries(problems).map(([field, key]) => [`${field}Valid`, IntlMessages(key)]));
  const isFormValid = Object.keys(problems).length === 0;

  const onPatientChange = e => {
    const patientId = e.target.value;

    onBulkForm({ fatherId: patientId });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      if (problems.fatherId) notification('error', 'msg.required.select.patient', 'alert.error.title');
      return;
    }

    const payload = buildEventPayload(formState);
    setLoading(true);
    if (validInt(idEvent) === 0) {
      request.POST('hospital/process/events', payload, (resp) => {
        setLoading(false);
        setIdEvent(resp.data.id);
        fnGetEvents(idPatientFile);
      }, (err) => {
        setLoading(false);
      });
    } else {
      request.PUT(`hospital/process/events/${idEvent}`, payload, (resp) => {
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
    printDocument({ ...printEventOptions(fatherId, idEvent), setLoading });
  }

  // Aseguradoras, términos y tipos de asegurado del formulario.
  useEffect(() => {
    request.GET('hospital/process/events/insuranceOptions', (resp) => {
      const data = resp.data || {};
      const asOption = (item) => ({ ...item, value: item.id, label: item.name });
      setInsuranceOptions({ insurers: (data.insurers || []).map(asOption), terms: (data.terms || []).map(asOption), secureTypes: (data.secureTypes || []).map(asOption) });
    }, () => {});
  }, []);

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
      insuranceOptions,
      fnSaveDocument,
      fnPrintDocument,
      onPatientChange
    }
  )
}
