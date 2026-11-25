import { useEffect, useRef, useState } from 'react'
import { request, buildUrl, notifyError } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';
import { toCalendarEvent, printParams } from './appointmentRules';

const today = () => DateHelper.format(DateHelper.now());

// SPEC v2-153-sr: el calendario pide al back solo las citas PROGRAMADAS del rango visible (las canceladas no se muestran) y recarga al cambiar de mes o de médico. Los nombres del paciente y del
// médico vienen en la respuesta. El listado del día se imprime por GET, en memoria.
export const useScheduledAppointments = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openModalAppointment, setOpenModalAppointment] = useState(false);
  const [specialistId, setSpecialistId] = useState(0);
  const [listDoctors, setListDoctors] = useState([]);
  const [listPatients, setListPatients] = useState([]);
  const [listSpecialties, setListSpecialties] = useState([]);
  const [listAppointments, setListAppointments] = useState([]);
  const [printDate, setPrintDate] = useState(today());
  const range = useRef(null);
  const lastRequest = useRef(0);

  const fnGetData = (filterSpecialistId = specialistId, visible = range.current) => {
    if (!visible) return;
    const requestId = lastRequest.current + 1;
    lastRequest.current = requestId;
    setLoading(true);
    const params = { ...visible, ...(Number(filterSpecialistId) > 0 ? { specialistId: Number(filterSpecialistId) } : {}) };
    request.GET(buildUrl('hospital/process/appointments', params), (resp) => {
      // Una respuesta vieja nunca pisa a una más nueva (se cambió de mes o de médico mientras llegaba).
      if (requestId === lastRequest.current) setListAppointments(resp.data.map(toCalendarEvent));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // `datesSet` de FullCalendar: el rango visible cambió.
  const onDatesSet = (visible) => {
    range.current = visible;
    fnGetData(specialistId, visible);
  }

  const onSpecialistChange = (e) => {
    const { value } = e.target;
    setSpecialistId(value);
    fnGetData(value);
  }

  const fnNewAppointment = () => {
    setCurrentItem({});
    setOpenModalAppointment(true);
  }

  const fnAddAppointmentOnDate = (dateInfo) => {
    setCurrentItem({ date: dateInfo.dateStr.slice(0, 10) });
    setOpenModalAppointment(true);
  }

  const fnViewAppointment = ({ event }) => {
    setCurrentItem(event.extendedProps);
    setOpenModalAppointment(true);
  }

  const fnPrintList = () => {
    setLoading(true);
    request.GETPdf('hospital/process/appointments/print', printParams({ date: printDate, specialistId }), `Citas ${printDate}.pdf`, (err) => {
      setLoading(false);
      notifyError(err, 'page.appointments.msg.printError');
    }, 'GET', () => setLoading(false));
  }

  useEffect(() => {
    const asOptions = (resp) => resp.data.map((item) => ({ ...item, value: item.id, label: item.name }));
    request.GET('hospital/settings/specialists/getSL', (resp) => setListDoctors(asOptions(resp)), () => {});
    request.GET('hospital/process/expedients/getSL', (resp) => setListPatients(resp.data.map((item) => ({ ...item, value: item.id, label: `${item.dni} | ${item.name}` }))), () => {});
    request.GET('hospital/settings/specialties/getSL', (resp) => setListSpecialties(asOptions(resp)), () => {});
  }, []);

  const propsToControlPanel = {
    buttonsHome: [
      {
        title: "button.newAppointment",
        icon: "bi bi-calendar-plus",
        onClick: fnNewAppointment
      },
      {
        title: "button.printList",
        icon: "iconsminds-printer",
        onClick: fnPrintList
      }
    ],
    disableTab: [false, true, true]
  }

  const dataModalAppointment = {
    setLoading,
    currentItem,
    listDoctors,
    listPatients,
    listSpecialties,
    fnGetData
  }

  return (
    {
      propsToControlPanel,
      listAppointments,
      specialistId,
      listDoctors,
      printDate,
      setPrintDate,
      onSpecialistChange,
      onDatesSet,
      fnAddAppointmentOnDate,
      fnViewAppointment,
      openModalAppointment,
      setOpenModalAppointment,
      dataModalAppointment
    }
  )
}
